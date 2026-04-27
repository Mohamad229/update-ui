import type { Metadata } from "next";

import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Damira Pharma",
    template: "%s | Damira Pharma",
  },
  description: "Leading pharmaceutical solutions in the Middle East",
  applicationName: "Damira Pharma",
  category: "healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={fontVariables}>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
