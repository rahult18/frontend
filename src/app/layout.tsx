import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import Link from "next/link";
// import {
//   NavigationMenu,
//   NavigationMenuList,
//   NavigationMenuItem,
//   NavigationMenuLink,
// } from "@/components/ui/navigation-menu";
// import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Exergi Dashboard",
  description: "Made by Rahul Reddy Talatala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <div className="flex justify-center mb-4">
          <div className="rounded-lg shadow-lg   p-2">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-row space-x-1">
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={` ${navigationMenuTriggerStyle()}`}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/solar-irradiance" legacyBehavior passHref>
                    <NavigationMenuLink className={` ${navigationMenuTriggerStyle()}`}>
                      Solar Irradiance Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/savings-calculator" legacyBehavior passHref>
                    <NavigationMenuLink className={` ${navigationMenuTriggerStyle()}`}>
                      Savings Calculator & Electricity Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div> */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}