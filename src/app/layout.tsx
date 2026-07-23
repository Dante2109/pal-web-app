import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "MediGuardian — Emergency Medical Profile",
  description: "Healthcare platform for emergency medical care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-base text-ink antialiased">
        <AuthProvider>
          <NavBar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-card border-t border-border px-6 py-3 text-center text-[10px] text-warm-gray shrink-0">
            MediGuardian · Emergency Medical Profile System
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
