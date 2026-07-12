import type { Metadata } from "next";
import { Geist,Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionKeeper } from "@/components/SessionKeeper";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"West African Transform Margin 2027",template:"%s | WAT Margin 2027"},description:"AAPG/EAGE symposium on the geology, petroleum systems and exploration potential of the West African Transform Margin, 19–21 April 2027 in Abidjan, Côte d’Ivoire.",other:{"codex-preview":"development"},icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="scroll-smooth"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><SessionKeeper/>{children}</body></html>}
