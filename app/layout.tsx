import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/global/navbar/Navbar";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import Footer from "@/components/global/footer/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ProfileModal from "@/components/auth/ProfileModal";

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie XII",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        loraHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
            <LoginModal />
            <RegisterModal />
            <ProfileModal />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
