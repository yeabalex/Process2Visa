import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Process2Visa - Travel Consultancy Platform",
  description: "Your trusted travel consultancy partner for visa applications, travel planning, and comprehensive travel services. Get expert assistance with visa processes and travel arrangements.",
  generator: "Process2Visa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
