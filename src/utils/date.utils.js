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

// Combine le début de partie (Date) avec une heure de table "HH:mm" locale → ISO.
// Une heure bien plus tôt que le début (meet-up 22:00, table 00:30) tombe le lendemain.
export function combineDateAndTime(start, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(start);
  combined.setHours(hours, minutes, 0, 0);
  if (start - combined > 12 * 60 * 60 * 1000) combined.setDate(combined.getDate() + 1);
  return combined.toISOString();
}

// Minuit local aujourd'hui → minuit local demain, pour que le serveur (en UTC) découpe les jours
// comme l'utilisateur
export function getLocalDayBounds() {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString() };
}

// Valeur "YYYY-MM-DDTHH:mm" en heure LOCALE pour un <input type="datetime-local">
// (toISOString().slice(0, 16) donnerait l'heure UTC, décalée de 1-2 h en Belgique)
export function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}