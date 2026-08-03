import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "clearcoat — photo-to-quote studio",
  description: "A confident, transparent way to turn vehicle photos into detailing quotes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
