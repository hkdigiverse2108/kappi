// Order times are saved in UTC by the backend; these show them in Indian time (IST)
const IST = 'Asia/Kolkata';

const parts = (iso, options) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...options }).format(new Date(iso));

// "3:22 PM"
export const istClock = (iso) => parts(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();

// "26 Oct 2026"
export const istDate = (iso) => parts(iso, { day: '2-digit', month: 'short', year: 'numeric' });

// "26 Oct 2026, 3:22 PM"
export const istDateTime = (iso) => `${istDate(iso)}, ${istClock(iso)}`;

// "26 Oct, 3:22 PM"
export const istShortDateTime = (iso) => `${parts(iso, { day: '2-digit', month: 'short' })}, ${istClock(iso)}`;

// "Today, 3:22 PM" / "Yesterday, 3:22 PM" / "26 Oct, 3:22 PM"
export const istFriendly = (iso) => {
  const day = (d) => parts(d, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  if (day(iso) === day(now)) return `Today, ${istClock(iso)}`;
  if (day(iso) === day(yesterday)) return `Yesterday, ${istClock(iso)}`;
  return istShortDateTime(iso);
};
