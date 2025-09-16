"use server";
import { sessionSchema } from "@/schemas/sessionSchema";

export async function addGameAction(prevState, formData) {
  try {
    const raw = Object.fromEntries(formData);
    const parsed = sessionSchema.parse({
      ...raw,
      enableBlindTimer: !!raw.enableBlindTimer,
      allowRebuys: !!raw.allowRebuys,
      isPrivate: !!raw.isPrivate,
      sendInvitesNow: !!raw.sendInvitesNow,
    });

    // ✅ Ici parsed contient les données validées et typées
    console.log("Validated session:", parsed);

    // TODO: sauvegarder en DB via ton backend

    return { message: "Session created!", data: parsed };
  } catch (err) {
    if (err.errors) {
      return { message: err.errors[0].message, data: prevState.data };
    }
    return { message: "Something went wrong", data: prevState.data };
  }
}
