const PageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
        {description && <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row sm:items-center">{actions}</div>}
    </div>
  );
};

export default PageHeader;
