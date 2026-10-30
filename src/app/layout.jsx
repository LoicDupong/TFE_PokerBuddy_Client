import { Roboto, Barlow_Condensed } from "next/font/google";
import "./globals.scss";
import "./styles/base/base.scss";
import "./styles/base/typography.scss";
import "./styles/pages/home.scss";
import "./styles/pages/learn.scss";
import "./styles/pages/profile.scss";
import "./styles/pages/manager.scss";
import "./styles/pages/invite.scss";
import "./styles/pages/help.scss";
import "./styles/pages/admin.scss";


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
import Toaster from "@/components/toast/toaster.jsx";
import "../components/toast/toast.scss";
import "../components/toast/toaster.scss";
import AuthInit from "@/components/auth/auth-init.jsx";
import PageViewTracker from "@/components/analytics/page-view-tracker.jsx";
import { I18nProvider } from "@/i18n/i18n-provider.jsx";
import { getLocale, getT } from "@/i18n/server.js";

// Police servie par Next (plus d'@import Google Fonts bloquant dans le SCSS)
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

// Police d'affichage condensée pour titres, timer et blinds
const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const MESSAGES = {
  en: {
    title: "PokerBuddy | Home Poker Games Manager",
    description: "PokerBuddy, your best friend to manage home poker games with your friends!",
  },
  fr: {
    title: "PokerBuddy | Tes parties de poker entre amis",
    description: "PokerBuddy, ton meilleur allié pour organiser tes parties de poker entre amis !",
  },
};

export async function generateMetadata() {
  const { t } = await getT(MESSAGES);
  return {
    title: t("title"),
    description: t("description"),
    // public/manifest.json n'est pas lié automatiquement par Next : sans ça, pas d'installation PWA sur Android
    manifest: "/manifest.json",
  };
}

export default async function RootLayout({ children }) {
  // Langue lue dans le cookie (ou Accept-Language) : le HTML serveur est déjà dans la bonne langue
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-title" content="PokerBuddy" />
      </head>

      <body className={`${roboto.variable} ${barlowCondensed.variable}`}>
        <I18nProvider initialLocale={locale}>
          <AuthInit />
          <PageViewTracker />
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </I18nProvider>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}
