import Header from "@/layout/header/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header noTabs={false} />
      <div className='mt-[150px] md:mt-[80px]' />
      {children}
    </>
  );
}
