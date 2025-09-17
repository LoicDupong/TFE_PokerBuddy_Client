"use server";

import { validateRegister } from "@/schemas/authSchema.js";


export async function registerAction(prevState, formData) {
    const data = Object.fromEntries(formData);
    const validation = validateRegister(data);

    if (!validation.ok) {
    return {
      success: false,
      errorMessage: validation.errors,
      data,
    };
  }

  return {
    success: true,
    errorMessage: [],
    data: validation.data,
  };
}
