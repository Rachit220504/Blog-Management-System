import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="site-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="panel max-w-xl rounded-[2rem] p-8 text-center md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">We could not find that article.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
          The page may have moved, been unpublished, or the slug may be incorrect.
        </p>
        <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
          Return home
        </Link>
      </div>
    </div>
  );
}