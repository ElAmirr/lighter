import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  themeColor: "#FFD60A",
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
    <html lang="en" className={`${interSans.variable} ${spaceGrotesk.variable} ${spaceGrotesk.className} h-full antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col justify-start items-center bg-[var(--bg)] text-[var(--text-1)]">
        <div className="w-full max-w-[390px] min-h-screen bg-[var(--bg)] flex flex-col relative overflow-x-hidden shadow-2xl shadow-black/50">
          {children}
        </div>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`}
        </Script>
      </body>
    </html>
  );
}

