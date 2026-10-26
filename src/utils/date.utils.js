export function shortDateTime(date) {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}


export function shortTime(date) {
  return new Date(date).toLocaleString("fr-FR", {
    timeStyle: "short",
  });
}

// Valeur "YYYY-MM-DDTHH:mm" en heure LOCALE pour un <input type="datetime-local">
// (toISOString().slice(0, 16) donnerait l'heure UTC, décalée de 1-2 h en Belgique)
export function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}