import { AuthProvider } from './context/AuthContext';
// import { CommunityProvider } from './context/CommunityContext';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Social App",
  description: "A minimalistic social app with communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
       
            {children}
         
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
