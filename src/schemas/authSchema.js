import { z } from "zod";

// Règles du mot de passe : les mêmes côté serveur (validatePassword), à l'inscription,
// au changement de mot de passe et au mot de passe oublié
const passwordSchema = z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

const emailSchema = z.email("Invalid email address")
    .min(1, "Email is required");

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
export function getPasswordError(value) {
    const result = passwordSchema.safeParse(value ?? "");
    return result.success ? null : result.error.issues[0].message;
}

// ✅ Login : email + password
const loginSchema = z.object({
    email: emailSchema,

    password: z.string()
        .min(1, "Password is required"),
});

// Validation Login
export function validateLogin(data) {
    return toResult(loginSchema, data);
}


// ✅ Register : username + email + password + confirmPassword
const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must be less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers (no spaces or special characters)"),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // 👉 l’erreur s’affiche sous confirmPassword
});

// Validation Register
export function validateRegister(data) {
    return toResult(registerSchema, data);
}


// ✅ Mot de passe oublié : email
const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(emailSchema),
});

export function validateForgotPassword(data) {
    return toResult(forgotPasswordSchema, data);
}


// ✅ Nouveau mot de passe (lien reçu par email) : password + confirmPassword
const resetPasswordSchema = z.object({
    password: passwordSchema,

    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function validateResetPassword(data) {
    return toResult(resetPasswordSchema, data);
}
