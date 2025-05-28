import type { Metadata } from "next";
import Navbar from "./Navbar";

import "@/styles/globals.css";
import "@/styles/background.css"
import Footer from "./Footer";

export const metadata: Metadata = {
  title: "Mentipedia",
  description: "La enciclopedia de las mentiras",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="backgroundPaper h-100% min-h-screen flex flex-col font-[TimesNewRoman]">
        <Navbar/>
        <main className="flex-grow">
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
}
