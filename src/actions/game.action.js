"use server";

import { validateSession } from "@/schemas/sessionSchema.js";
import gameService from "@/services/game.service.js";


export async function addGameAction(prevState, formData) {
  const data = Object.fromEntries(formData);
  const validation = validateSession(data);

  console.log(data);


  if (!validation.ok) {
    return {
      success: false,
      errorMessage: validation.errors,
      data,
    };
  }

  // Appel backend
  const res = await gameService.create(validation.data);

  if (!res.success) {
    return {
      success: false,
      errorMessage: [{ field: "_", message: res.errorMessage }],
      data,
    };
  }


  return {
    success: true,
    errorMessage: [],
    data: res.data,
  };
}
