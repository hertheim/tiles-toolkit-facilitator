import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WorkshopProvider } from "@/lib/workshop-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiles Ideation Application",
  description: "AI-Facilitated Tiles Ideation Application for creative workshops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WorkshopProvider>
          {children}
          <Toaster position="top-right" />
        </WorkshopProvider>
      </body>
    </html>
  );
}
