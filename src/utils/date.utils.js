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

const pad2 = (n) => String(n).padStart(2, "0");
const hhmm = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// Même jour calendaire en heure locale (comparer les ISO donnerait le jour UTC)
export function isSameLocalDay(a, b = new Date()) {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

// Date lisible d'un coup d'oeil : "Tonight 21:30", "Tomorrow 20:00", "Fri 30/10 20:00"
// (l'année n'apparaît que si ce n'est pas l'année en cours)
export function relativeDateTime(date) {
  const d = new Date(date);
  const now = new Date();
  const time = hhmm(d);
  if (isSameLocalDay(d, now)) return `${d.getHours() >= 18 ? "Tonight" : "Today"} ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(d, tomorrow)) return `Tomorrow ${time}`;
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const year = d.getFullYear() !== now.getFullYear() ? `/${d.getFullYear()}` : "";
  return `${weekday} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}${year} ${time}`;
}
