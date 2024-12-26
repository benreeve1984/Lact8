import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lact8 - Lactate Testing Analysis",
  description: "Analyze lactate test results and determine training zones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased overflow-y-auto">
        {children}
      </body>
    </html>
  );
}
