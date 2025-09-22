"use server";

import { validateRegister } from "@/schemas/authSchema.js";
import api from "@/lib/api.js"; // axios setup

export async function registerAction(prevState, formData) {
  const data = Object.fromEntries(formData);
  const validation = validateRegister(data);

  // Vérif Zod
  if (!validation.ok) {
    return {
      success: false,
      errorMessage: validation.errors,
      data,
    };
  }

  try {
    // 🔹 Appel backend → /auth/register
    const res = await api.post("/auth/register", {
      username: validation.data.username,
      email: validation.data.email,
      password: validation.data.password,
    });

    const { token, user } = res.data; // backend doit renvoyer { token, user }

    return {
      success: true,
      errorMessage: [],
      data: { user, token },
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: [
        {
          field: "form",
          message: error.response?.data?.error || "Registration failed",
        },
      ],
      data,
    };
  }
}
