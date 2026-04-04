import Header from "@/layout/header/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header noTabs={false} />
      <div className='mt-[190px] md:mt-50 xl:mt-30' />
      {children}
    </>
  );
}
