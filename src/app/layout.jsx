import { Roboto } from "next/font/google";
import "./globals.scss";
import "./styles/base/base.scss";
import "./styles/base/typography.scss";
import "./styles/pages/home.scss";
import "./styles/pages/learn.scss";
import "./styles/pages/profile.scss";
import "./styles/pages/manager.scss";
import "./styles/pages/invite.scss";


import Header from "@/ui/header/header.jsx";
import "../ui/header/header.scss";
import "../ui/navbar/navbar.scss";
import Footer from "@/ui/footer/footer.jsx";
import "../ui/footer/footer.scss";
import "../ui/styles/form.scss";
import "../ui/styles/modal.scss";

import "../components/pwa/installPrompt.scss";

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Toast from "@/components/toast/toast.jsx";
import "../components/toast/toast.scss";
import AuthInit from "@/components/auth/auth-init.jsx";

// Police servie par Next (plus d'@import Google Fonts bloquant dans le SCSS)
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata = {
  title: "PokerBuddy | Home Poker Games Manager",
  description: "PokerBuddy your bestfriend to manage home poker games with your bestfriends !",
  // public/manifest.json n'est pas lié automatiquement par Next : sans ça, pas d'installation PWA sur Android
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="PokerBuddy" />
      </head>

      <body className={roboto.variable}>
        <AuthInit />
        <Header />
        <main>{children}</main>
        <Footer />
        <Toast />
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}
