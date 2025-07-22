export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-vh w-vw p-5">
      <header className="flex flex-col gap-7">
        {/* <NavLinks /> */}
        <div className="border-b border-black" />
      </header>
      <div className="pt-5">{children}</div>
    </main>
  );
}
