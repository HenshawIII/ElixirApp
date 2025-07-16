'use client'
import { AuthProvider } from './context/AuthContext';
// import { CommunityProvider } from './context/CommunityContext';
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// export const metadata: Metadata = {
//   title: "Elixir",
//   description: "A minimalistic social app with communities",
//   icons: {
//     icon: "/TipC.png", // or "/favicon.ico" if you use that
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Elixir</title>
        <meta name="description" content="A minimalistic social app with communities" />
        <link rel="icon" href="/Tipee.png" />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col h-full`}> 
        <AuthProvider>
          <div className="flex flex-col min-h-screen h-full">
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                <p>© 2025 Elixir. All rights reserved.</p>
                <>Created by <a href="https://X.com/Devansa01" target='_blank' rel='noopener noreferrer' className="text-blue-600 hover:underline">Inameti</a></>
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
