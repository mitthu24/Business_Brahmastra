import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "90-Day Business School — Learn Business & Startups",
    template: "%s · 90-Day Business School",
  },
  description:
    "Learn business, startups, finance, marketing, sales, operations, strategy and entrepreneurship through a practical 90-day roadmap.",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-foreground">{children}</body>
    </html>
  );
}
