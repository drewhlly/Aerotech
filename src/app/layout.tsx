import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerotech",
  description: "AI-powered company and workforce operating platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
