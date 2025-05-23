import type { Metadata } from "next";
import Navbar from "./Navbar";

import "@/styles/globals.css";
import "@/styles/background.css"

export const metadata: Metadata = {
  title: "Mentipedia",
  description: "La enciclopedia de las mentiras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="backgroundPaper">
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
