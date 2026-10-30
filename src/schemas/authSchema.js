import { z } from "zod";

// Messages de validation par langue. Les fonctions validate* prennent la langue en dernier argument
// (par défaut "en") : const { locale } = useLocale() ; validateLogin(data, locale).
const MESSAGES = {
    en: {
        passwordMin: "Password must be at least 6 characters",
        passwordUpper: "Password must contain at least one uppercase letter",
        passwordDigit: "Password must contain at least one number",
        emailInvalid: "Invalid email address",
        emailRequired: "Email is required",
        passwordRequired: "Password is required",
        usernameMin: "Username must be at least 3 characters",
        usernameMax: "Username must be less than 15 characters",
        usernameChars: "Username can only contain letters and numbers (no spaces or special characters)",
        confirmRequired: "Please confirm your password",
        mismatch: "Passwords do not match",
    },
    fr: {
        passwordMin: "Le mot de passe doit faire au moins 6 caractères",
        passwordUpper: "Le mot de passe doit contenir au moins une majuscule",
        passwordDigit: "Le mot de passe doit contenir au moins un chiffre",
        emailInvalid: "Adresse email invalide",
        emailRequired: "L'email est obligatoire",
        passwordRequired: "Le mot de passe est obligatoire",
        usernameMin: "Le pseudo doit faire au moins 3 caractères",
        usernameMax: "Le pseudo doit faire moins de 15 caractères",
        usernameChars: "Le pseudo ne peut contenir que des lettres et des chiffres (ni espaces ni caractères spéciaux)",
        confirmRequired: "Confirme ton mot de passe",
        mismatch: "Les mots de passe ne correspondent pas",
    },
};

const cache = {};

// Schémas construits une fois par langue
function build(locale) {
    const m = MESSAGES[locale] ?? MESSAGES.en;

    // Règles du mot de passe : les mêmes côté serveur (validatePassword), à l'inscription,
    // au changement de mot de passe et au mot de passe oublié
    const passwordSchema = z.string()
        .min(6, m.passwordMin)
        .regex(/[A-Z]/, m.passwordUpper)
        .regex(/[0-9]/, m.passwordDigit);

    const emailSchema = z.email(m.emailInvalid)
        .min(1, m.emailRequired);

    const confirm = z.string().min(1, m.confirmRequired);
    const mismatch = { message: m.mismatch, path: ["confirmPassword"] }; // l'erreur s'affiche sous confirmPassword

    return {
        passwordSchema,
        login: z.object({
            email: emailSchema,
            password: z.string().min(1, m.passwordRequired),
        }),
        register: z.object({
            username: z.string()
                .min(3, m.usernameMin)
                .max(15, m.usernameMax)
                .regex(/^[a-zA-Z0-9]+$/, m.usernameChars),
            email: emailSchema,
            password: passwordSchema,
            confirmPassword: confirm,
        }).refine((data) => data.password === data.confirmPassword, mismatch),
        forgotPassword: z.object({
            email: z.string().trim().toLowerCase().pipe(emailSchema),
        }),
        resetPassword: z.object({
            password: passwordSchema,
            confirmPassword: confirm,
        }).refine((data) => data.password === data.confirmPassword, mismatch),
    };
}

const schemasFor = (locale) => (cache[locale] ??= build(locale));

// Résultat commun : { ok: true, data } ou { ok: false, errors: [{ field, message }] }
function toResult(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
        }));
        return { ok: false, errors };
    }
    return { ok: true, data: result.data };
}

// Premier message d'erreur d'un mot de passe, ou null s'il respecte les règles
export function getPasswordError(value, locale = "en") {
    const result = schemasFor(locale).passwordSchema.safeParse(value ?? "");
    return result.success ? null : result.error.issues[0].message;
}

export const validateLogin = (data, locale = "en") => toResult(schemasFor(locale).login, data);
export const validateRegister = (data, locale = "en") => toResult(schemasFor(locale).register, data);
export const validateForgotPassword = (data, locale = "en") => toResult(schemasFor(locale).forgotPassword, data);
export const validateResetPassword = (data, locale = "en") => toResult(schemasFor(locale).resetPassword, data);
