import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import QueryProvider from "./query";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Welcome to Near Mart – India’s Local Online Grocery App! Get Fresh Vegetables, Fruits & Essentials Delivered Next Day",
  description: "Shop fresh groceries, fruits, vegetables, and daily essentials from trusted local stores with Near Mart. Order today and get everything delivered fresh to your doorstep the next day — easy, reliable, and local.",
  keywords: "near mart, next day grocery delivery, local grocery app, buy groceries online,fresh vegetables near me, fruits delivery, online grocery india, local store delivery, near mart app, grocery next day delivery service"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased`}>
        <QueryProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
