// intlLocale : fourni par useT() (en-GB / fr-BE) ; format jj/mm/aaaa par défaut
export function shortDateTime(date, intlLocale = "fr-FR") {
  return new Date(date).toLocaleString(intlLocale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}


export function shortTime(date, intlLocale = "fr-FR") {
  return new Date(date).toLocaleString(intlLocale, {
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
const RELATIVE_WORDS = {
  en: { tonight: "Tonight", today: "Today", tomorrow: "Tomorrow", intl: "en-GB" },
  fr: { tonight: "Ce soir", today: "Aujourd'hui", tomorrow: "Demain", intl: "fr-BE" },
};

export function relativeDateTime(date, locale = "en") {
  const words = RELATIVE_WORDS[locale] || RELATIVE_WORDS.en;
  const d = new Date(date);
  const now = new Date();
  const time = hhmm(d);
  if (isSameLocalDay(d, now)) return `${d.getHours() >= 18 ? words.tonight : words.today} ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameLocalDay(d, tomorrow)) return `${words.tomorrow} ${time}`;
  const weekday = d.toLocaleDateString(words.intl, { weekday: "short" });
  const year = d.getFullYear() !== now.getFullYear() ? `/${d.getFullYear()}` : "";
  return `${weekday} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}${year} ${time}`;
}
