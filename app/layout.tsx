import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Learnify — Find the right course for you",
  description: "See your personalised recommendations based on your interests and goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen p-3 md:p-6">
        <Providers>
          <div className="page-frame min-h-[calc(100vh-2rem)] pb-16 shadow-sm">
            <NavBar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
