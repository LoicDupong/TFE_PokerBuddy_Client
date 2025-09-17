import { z } from "zod";

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dateTime: z.string().min(1, "Date & Time is required"),
  location: z.string().min(1, "Location is required"),

  buyIn: z.coerce.number().min(0, "Buy-in must be positive"),

  currency: z.enum(["EUR", "USD", "GBP"], {
    errorMap: () => ({ message: "Currency must be EUR, USD, or GBP" }),
  }),

  smallBlind: z.coerce.number().min(1, "Small blind must be >= 1"),
  bigBlind: z.coerce.number().min(1, "Big blind must be >= 1"),

  levelDurationMin: z.coerce.number().min(1).max(60, "Duration max 60 min"),

  enableBlindTimer: z.boolean().default(true),
  maxPlayers: z.union([
    z.coerce.number().min(2).max(20),
    z.literal("").transform(() => null),
  ]).optional(),

  allowRebuys: z.boolean().default(false),
  isPrivate: z.boolean().default(true),

  invitedEmails: z.string()
    .transform((val) => val.split(",").map((e) => e.trim()).filter(Boolean))
    .refine(
      (emails) => emails.every((e) => /\S+@\S+\.\S+/.test(e)),
      { message: "One or more emails are invalid" }
    ),

  sendInvitesNow: z.boolean().default(false),
  notes: z.string().max(500, "Notes too long").optional(),
})
  .superRefine((data, ctx) => {
    if (data.bigBlind <= data.smallBlind) {
      ctx.addIssue({
        code: "custom",
        path: ["bigBlind"], // erreur attachée au champ bigBlind
        message: "Big blind must be greater than small blind",
      });
    }
  });


// Validation Session Form
export function validateSession(data) {
  const result = sessionSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return { ok: false, errors };
  }
  return { ok: true, data: result.data };
}