import Link from 'next/link';

const buildHref = (basePath, currentParams, page) => {
  const params = new URLSearchParams();

  Object.entries(currentParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '' && key !== 'page') {
      params.set(key, String(value));
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export default function Pagination({ basePath = '/', currentPage = 1, totalPages = 1, searchParams = {} }) {
  if (!totalPages || totalPages <= 1) return null;

  const pageNumbers = [];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pageNumbers.push(page);
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-white/8 bg-slate-950/45 p-4 sm:p-5">
      <div className="text-sm text-slate-400">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, currentPage - 1))}
          aria-disabled={currentPage <= 1}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${currentPage <= 1 ? 'pointer-events-none border-white/6 bg-white/3 text-slate-500' : 'border-white/10 bg-white/5 text-white hover:border-cyan-400/20 hover:bg-cyan-400/10'}`}
        >
          Previous
        </Link>

        {currentPage > 2 ? <span className="px-2 text-slate-500">...</span> : null}

        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={buildHref(basePath, searchParams, page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-11 rounded-2xl border px-4 py-2 text-center text-sm font-medium transition ${page === currentPage ? 'border-cyan-400/30 bg-cyan-400 text-slate-950' : 'border-white/10 bg-white/5 text-white hover:border-cyan-400/20 hover:bg-cyan-400/10'}`}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages - 1 ? <span className="px-2 text-slate-500">...</span> : null}

        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage >= totalPages}
          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${currentPage >= totalPages ? 'pointer-events-none border-white/6 bg-white/3 text-slate-500' : 'border-white/10 bg-white/5 text-white hover:border-cyan-400/20 hover:bg-cyan-400/10'}`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}