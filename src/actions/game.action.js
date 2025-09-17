"use server";

import { validateSession } from "@/schemas/sessionSchema.js";


export async function sessionAction(prevState, formData) {
    const data = Object.fromEntries(formData);
    const validation = validateSession(data);

    if (!validation.ok) {
    return {
      success: false,
      errorMessage: validation.errors,
      data,
    };
  }

  // TODO: sauvegarder en DB via ton backend
  
  return {
    success: true,
    errorMessage: [],
    data: validation.data,
  };
}
