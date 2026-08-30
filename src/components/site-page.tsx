export function SitePage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-neutral-700">
        {children}
      </div>
    </div>
  );
}
