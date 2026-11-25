import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces, Shantell_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollEffects from "@/components/ScrollEffects";
import RouteCurtain from "@/components/RouteCurtain";
import PawTrailCanvas from "@/components/PawTrailCanvas";
import WhatsAppBar from "@/components/WhatsAppBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  axes: ["BNCE", "INFM"],
  variable: "--font-shantell",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffdf8",
};

export const metadata: Metadata = {
  title: "TeddyPups U.A.E. — Premium teacup puppies in Dubai",
  description:
    "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.",
  metadataBase: new URL("https://puppy.instabizweb.com"),
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "TeddyPups U.A.E. — Premium teacup puppies in Dubai",
    description:
      "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.",
    url: "https://puppy.instabizweb.com",
    siteName: "TeddyPups U.A.E.",
    images: [
      {
        url: "/brand/logo.png",
        width: 1200,
        height: 630,
        alt: "TeddyPups U.A.E.",
      },
    ],
    locale: "en_AE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} ${shantellSans.variable}`}
    >
      <body>
        <RouteCurtain />
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="relative pt-[var(--header-h)] outline-none">
          {children}
        </main>
        <Footer />
        <WhatsAppBar />
        <PawTrailCanvas />
        <ScrollEffects />
      </body>
    </html>
  );
}
