import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/comps/sbc";
import LayoutWithSidebar from "@/comps/lwsidebar";
import ChatBot from "@/comps/chatbot";  // ← add this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VisuoSlayer",
  description: "DS & Algo Visualizer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
        </SidebarProvider>
        <ChatBot />  {/* ← add this — outside SidebarProvider so it floats globally */}
      </body>
    </html>
  );
}