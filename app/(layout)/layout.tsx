import Header from "@/layout/header/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header noTabs={false} />
      <div className='mt-[165px] md:mt-20' />
      {children}
    </>
  );
}
