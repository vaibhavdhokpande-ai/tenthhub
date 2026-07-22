import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "10th Standard Prep — SSC & CBSE",
  description: "Syllabus, notes, video lessons and quizzes for 10th Standard SSC and CBSE students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
