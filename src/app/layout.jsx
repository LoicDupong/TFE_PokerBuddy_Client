import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import "./styles/base/base.scss";
import "./styles/base/typography.scss";
import "./styles/pages/home.scss";
import "./styles/pages/profile.scss";

import Header from "@/ui/header/header.jsx";
import "../ui/header/header.scss";
import "../ui/navbar/navbar.scss";
import Footer from "@/ui/footer/footer.jsx";
import "../ui/footer/footer.scss";
import "../ui/styles/form.scss";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PokerBuddy | Home Poker Games Manager",
  description: "PokerBuddy your bestfriend to manage home poker games with your bestfriends !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="PokerBuddy" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
