import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../(components)/Navbar/Navigator";
import { Footer } from "../(components)/footer/Footer";
import ProgressBarProvider from "../progresiveBarProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    template: 'kvv shop',
    default: 'kvv shop',
  },
  description: 'Welcome to the best construction e-commerce in Rwanda.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/logo/logo1.png" type="image/png" />
      <meta name="keywords" content="construction kvv, construction kvv shop, construction kvv, kvv, e-commerce, construction, real estate in Rwanda, kvv Rwanda, Rwanda, construction e-commerce" />
      <meta property="og:title" content="construction kvv shop" />
      <meta property="og:description" content="Welcome to the best online construction shop in Rwanda." />
      <meta property="og:image" content="/F9.jpeg" />
    </head>
    <body className="flex flex-col justify-start">
      <ProgressBarProvider>
        <Navbar />
        {children}
        <Footer />
      </ProgressBarProvider>
      <SpeedInsights />
    </body>
  </html>
  );
}
