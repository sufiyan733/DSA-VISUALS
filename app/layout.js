import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/comps/ConditionalLayout";
import ChatBot from "@/comps/chatbot";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "VisuoSlayer",
  description: "DS & Algo Visualizer",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ConditionalLayout>{children}</ConditionalLayout>
          <ChatBot />
        </body>
      </html>
    </ClerkProvider>
  );
}