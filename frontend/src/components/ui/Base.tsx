import React from 'react';

export const Card = ({children, className = "", onClick}: {
  children: React.ReactNode,
  className?: string,
  onClick?: () => void
}) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Button = ({children, onClick, variant = 'primary', className = '', isDisabled = false}: {
  children: React.ReactNode,
  onClick?: () => void,
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
  className?: string,
  isDisabled?: boolean
}) => {
  const variants = {
    primary: "font-black bg-blue-600 dark:bg-amber-500 text-white dark:text-stone-900",
    secondary: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
    ghost: "bg-transparent text-stone-400 hover:text-stone-900 dark:hover:text-stone-100",
    danger: "font-medium text-red-500 hover:opacity-70"
  };

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({label, ...props}: {
  label?: string
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) => {
  const isTextArea = props.type === 'textarea';
  const Component = isTextArea ? 'textarea' : 'input';
  const baseClass = "w-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl py-3 px-5 outline-none focus:border-blue-600 dark:focus:border-amber-500 transition-all font-bold";

  return (
    <div className='space-y-1 text-left'>
      {label &&
        <label className='text-xs uppercase tracking-widest text-stone-400 block ml-4'>{label}</label>}
      <Component {...(props as any)}
                 className={`${baseClass} ${isTextArea ? 'min-h-32' : ''} ${props.className || ''}`}/>
    </div>
  );
};

export const Badge = ({children, icon, className = ""}: {
  children: React.ReactNode,
  icon?: string,
  className?: string
}) => (
  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black w-fit ${className}`}>
    {icon && <span className='opacity-60'>{icon}</span>}
    {children}
  </div>
);
