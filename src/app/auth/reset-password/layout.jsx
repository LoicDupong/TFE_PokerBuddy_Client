// La page reçoit le jeton dans son URL : jamais de referrer vers d'autres sites, jamais indexée
export const metadata = {
  title: "Choose a new password | PokerBuddy",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }) {
  return children;
}
