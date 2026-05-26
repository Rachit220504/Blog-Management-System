const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_20px_80px_rgba(2,6,23,0.4)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;
