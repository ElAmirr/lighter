import type { Metadata, Viewport } from "next";
import { Inter, Lalezar } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Lalezar — bold Arabic display font, perfect for street/teen aesthetic
const lalezar = Lalezar({
  variable: "--font-arabic",
  weight: "400",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "هات شعول - لعبة اجتماعية",
  description: "لعبة اجتماعية للولاعات في الشوارع التونسية.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "هات شعول",
  },
};

export const viewport: Viewport = {
  themeColor: "#F05423",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interSans.variable} ${lalezar.variable} h-full antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col justify-start items-center bg-[var(--color-davay-bg)] text-[var(--color-davay-text)]">
        <div className="w-full max-w-[390px] min-h-screen bg-[var(--color-davay-bg)] flex flex-col relative overflow-x-hidden shadow-2xl shadow-black/5">
          {children}
        </div>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`}
        </Script>
      </body>
    </html>
  );
}

