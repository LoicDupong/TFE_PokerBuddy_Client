import { z } from "zod";
import { parseAmountToCents } from "@/utils/money.utils.js";

const percent = (message) =>
  z.coerce.number({ message }).int(message).min(0, message).max(100, message);

const sessionSchema = z.object({
  // Titre
  name: z.string().min(1, "Title is required"),

  // Dates
  dateStart: z.string().min(1, "Date & Time is required"),
  realStart: z.string().optional().nullable(), // HH:mm optionnel

  // Localisation
  location: z.string().min(1, "Location is required"),

  // Argent
  buyIn: z.coerce.number().min(0, "Buy-in must be positive"),
  prizePool: z.coerce.number().min(0).default(0),
  currency: z.enum(["EUR", "USD", "GBP"], {
    errorMap: () => ({ message: "Currency must be EUR, USD, or GBP" }),
  }),

  // Blinds
  smallBlind: z.coerce.number().min(1, "Small blind must be >= 1"),
  bigBlind: z.coerce.number().min(1, "Big blind must be >= 1"),

  // Options
  levelDuration: z.coerce.number().min(1).max(120, "Duration max 120 min"),
  enableBlindTimer: z.preprocess(
    (val) => val === "on" || val === true,
    z.boolean()
  ).default(false),

  allowRebuys: z.preprocess(
    (val) => val === "on" || val === true,
    z.boolean()
  ).default(false),

  // Prix d'un rebuy / add-on, en unités saisies ("12,50") ; vide = prix du buy-in. Converti en centimes.
  rebuyAmount: z
    .string()
    .optional()
    .nullable()
    .transform((val, ctx) => {
      if (val == null || String(val).trim() === "") return null;
      const cents = parseAmountToCents(val);
      if (cents === null || cents <= 0) {
        ctx.addIssue({ code: "custom", message: "Rebuy price must be a positive amount" });
        return z.NEVER;
      }
      return cents;
    }),

  // PKO (bounties) : part de chaque entrée mise sur la tête du joueur, part versée tout de suite au KO
  pkoEnabled: z.preprocess(
    (val) => val === "on" || val === true,
    z.boolean()
  ).default(false),
  pkoBountyPercent: percent("Bounty share must be a whole percentage between 0 and 100").default(50),
  pkoCashPercent: percent("Knockout cash share must be a whole percentage between 0 and 100").default(50),

  maxPlayers: z.union([
    z.coerce.number().min(2).max(200),
    z.literal("").transform(() => null),
  ]).optional(),

  placesPaid: z.coerce.number().min(1).max(50),

  // Distribution des gains (JSON string cachée dans le form)
  payoutDistribution: z
    .string()
    .transform((val) => JSON.parse(val))
    .refine(
      (arr) =>
        Array.isArray(arr) &&
        arr.reduce((sum, p) => sum + Number(p.percent || 0), 0) === 100,
      { message: "Payout distribution must sum to 100%" }
    ),

  // Invites (string JSON → objet)
  invites: z
    .string()
    .transform((val) => JSON.parse(val))
    .default({ emails: [], friends: [], guests: [] }),

  // Description
  description: z.string().max(500, "Description too long").optional(),
})
  .superRefine((data, ctx) => {
    if (data.bigBlind <= data.smallBlind) {
      ctx.addIssue({
        code: "custom",
        path: ["bigBlind"],
        message: "Big blind must be greater than small blind",
      });
    }
  });

// Messages en français, indexés par le message anglais du schéma (le schéma reste la source de vérité)
const FR = {
  "Title is required": "Le titre est obligatoire",
  "Date & Time is required": "La date et l'heure sont obligatoires",
  "Location is required": "Le lieu est obligatoire",
  "Buy-in must be positive": "Le buy-in doit être positif",
  "Small blind must be >= 1": "La petite blind doit être d'au moins 1",
  "Big blind must be greater than small blind": "La grosse blind doit être supérieure à la petite blind",
  "Currency must be EUR, USD, or GBP": "La devise doit être EUR, USD ou GBP",
  "Duration max 120 min": "Durée maximale : 120 min",
  "Rebuy price must be a positive amount": "Le prix du rebuy doit être un montant positif",
  "Bounty share must be a whole percentage between 0 and 100": "La part de bounty doit être un pourcentage entier entre 0 et 100",
  "Knockout cash share must be a whole percentage between 0 and 100": "La part cash du KO doit être un pourcentage entier entre 0 et 100",
  "Payout distribution must sum to 100%": "La répartition des gains doit totaliser 100 %",
  "Description too long": "Description trop longue",
};

// Validation Session Form. locale : "en" | "fr" (messages d'erreur)
export function validateSession(data, locale = "en") {
  const result = sessionSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path[0],
      message: locale === "fr" ? (FR[issue.message] ?? issue.message) : issue.message,
    }));
    return { ok: false, errors };
  }
  // Le serveur attend des centimes sous le nom rebuyAmountCents
  const { rebuyAmount, ...rest } = result.data;
  return { ok: true, data: { ...rest, rebuyAmountCents: rebuyAmount ?? null } };
}
