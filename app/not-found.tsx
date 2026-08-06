import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f3] px-6">
      <section className="max-w-lg rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#123f34] font-serif text-xl font-bold text-[#e9b949]">DF</div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-[#648477]">404 · Record not found</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#173f35]">This page has left the burrow.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Return to the farm overview to continue managing your digital records.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#123f34] px-5 py-3 text-xs font-semibold text-white">Back to Dauson Farm</Link>
      </section>
    </main>
  );
}
