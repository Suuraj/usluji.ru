import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-stone-100 bg-white p-5 transition-all duration-300 dark:border-stone-800 dark:bg-stone-900 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  isDisabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  isDisabled?: boolean;
}) => {
  const variants = {
    primary:
      'bg-blue-600 font-black text-white dark:bg-amber-500 dark:text-stone-900',
    secondary:
      'border border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300',
    danger: 'font-medium text-red-500 hover:opacity-70',
  };

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`cursor-pointer rounded-full text-xs tracking-widest uppercase transition-all disabled:opacity-50 ${!isDisabled && 'active:scale-95'} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({
  label,
  ...props
}: {
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) => {
  const isTextArea = props.type === 'textarea';
  const Component = isTextArea ? 'textarea' : 'input';

  return (
    <div className='flex w-full flex-col gap-1 text-left'>
      {label && (
        <label className='ml-4 block text-xs tracking-widest text-stone-500 uppercase'>
          {label}
        </label>
      )}
      <Component
        {...(props as any)}
        className={`w-full rounded-2xl border border-stone-200 bg-stone-100 px-5 py-3 font-bold transition-all outline-none focus:border-blue-600 dark:border-stone-700 dark:bg-stone-800 dark:focus:border-amber-500 ${isTextArea ? 'min-h-32' : ''} ${props.className || ''}`}
      />
    </div>
  );
};

export const Badge = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${className}`}
  >
    {children}
  </div>
);

export const LocationIcon = ({
  className = 'w-4 h-4',
}: {
  className?: string;
}) => (
  <svg
    className={`${className} shrink-0`}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='3'
  >
    <path d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z' />
    <path d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' />
  </svg>
);

export const ProfileIcon = ({
  className = 'w-5 h-5',
}: {
  className?: string;
}) => (
  <svg
    className={`${className} shrink-0`}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' strokeLinecap='round' />
    <circle cx='12' cy='7' r='4' />
  </svg>
);

export const TelegramIcon = ({
  className = 'w-6 h-6',
}: {
  className?: string;
}) => (
  <svg className={`${className} shrink-0 fill-current`} viewBox='0 0 240 240'>
    <path d='M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z' />
  </svg>
);
