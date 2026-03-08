export const Avatar = ({
  src,
  name,
  className = '',
}: {
  src?: string | null;
  name: string;
  className?: string;
}) => (
  <div
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 font-black text-blue-600 transition-all select-none dark:border-stone-700 dark:bg-stone-800 dark:text-amber-500 ${className}`}
  >
    {src ? (
      <img src={src} className='h-full w-full object-cover' alt={name} />
    ) : (
      <span className='uppercase'>{name[0]}</span>
    )}
  </div>
);
