import { z } from "zod";

// ✅ Login : email + password
const loginSchema = z.object({
    email: z.email("Invalid email address")
        .min(1, "Email is required"),

    password: z.string()
        .min(1, "Password is required"),
});

// Validation Login
export function validateLogin(data) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return { ok: false, errors };
  }
  return { ok: true, data: result.data };
}


// ✅ Register : username + email + password + confirmPassword
const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must be less than 15 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers (no spaces or special characters)"),

    email: z.email("Invalid email address")
        .min(1, "Email is required"),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string()
        .min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // 👉 l’erreur s’affiche sous confirmPassword
});

// Validation Register
export function validateRegister(data) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return { ok: false, errors };
  }
  return { ok: true, data: result.data };
}


