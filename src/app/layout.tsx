import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Stash",
  description: "Your second brain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          position="bottom-right"
          gap={8}
          toastOptions={{
            classNames: {
              toast:
                "!bg-white !border !border-zinc-200 !shadow-lg !shadow-black/8 !rounded-xl !px-4 !py-3 !font-sans !min-w-[300px]",
              title: "!text-zinc-900 !font-medium !text-[13.5px]",
              description: "!text-zinc-500 !text-[12.5px]",
              error: "!bg-white !border-zinc-200",
              success: "!bg-white !border-zinc-200",
              warning: "!bg-white !border-zinc-200",
              info: "!bg-white !border-zinc-200",
              closeButton:
                "!bg-zinc-100 !border-zinc-200 !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-200",
            },
          }}
        />
      </body>
    </html>
  );
}
