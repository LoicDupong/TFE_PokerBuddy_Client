"use server";

import { validateLogin } from "@/schemas/authSchema.js";
import api from "@/lib/api.js"; // axios setup

export async function loginAction(prevState, formData) {
  const data = Object.fromEntries(formData);
  const validation = validateLogin(data);

  // Vérif Zod
  if (!validation.ok) {
    return {
      success: false,
      errorMessage: validation.errors,
      data,
    };
  }

  try {
    // 🔹 Appel backend → /auth/login
    const res = await api.post("/auth/login", {
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
          message: error.response?.data?.error || "Login failed",
        },
      ],
      data,
    };
  }
}
