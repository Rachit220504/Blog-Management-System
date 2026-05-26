import { X } from 'lucide-react';

const Modal = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
        {actions && <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-4">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
