import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerotech — People. Performance. Progress.",
  description:
    "Aerotech is an intelligent workforce operating system for recruitment, employees, attendance, training, performance, payroll and compliance.",
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
