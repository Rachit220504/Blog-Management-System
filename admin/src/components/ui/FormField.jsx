const baseInput = 'mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20';

export const inputClass = baseInput;

const FormField = ({ label, error, hint, children, required }) => {
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-slate-200">
          {label}{required ? <span className="ml-1 text-rose-400">*</span> : null}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </div>
  );
};

export default FormField;
