import { useMemo, useRef, useState } from 'react';
import type { SortOption, TabType } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const Navigation = ({
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
}: NavigationProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setIsSortOpen(false));

  const sortOptions = useMemo(() => {
    if (activeTab === 'orders') {
      return [
        { id: 'date', label: 'Новые' },
        { id: 'price_asc', label: 'Дешевые' },
        { id: 'price_desc', label: 'Дорогие' },
        { id: 'distance', label: 'Поблизости' },
      ] as const;
    }
    return [
      { id: 'rating', label: 'По рейтингу' },
      { id: 'distance', label: 'Поблизости' },
    ] as const;
  }, [activeTab]);

  return (
    <nav className='border-b border-stone-100 bg-white transition-colors dark:border-stone-800 dark:bg-stone-900'>
      <div className='relative mx-auto flex h-14 max-w-3xl items-center justify-between px-4 md:px-6'>
        <div className='flex h-full gap-2'>
          {(['orders', 'profiles'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-full cursor-pointer px-4 text-xs font-black tracking-widest uppercase transition-all ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-amber-500'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {tab === 'orders' ? 'Заказы' : 'Профили'}
              {activeTab === tab && (
                <div className='animate-in fade-in slide-in-from-bottom-1 absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-blue-600 dark:bg-amber-500' />
              )}
            </button>
          ))}
        </div>

        <div ref={menuRef} className='relative'>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-4 py-2 transition-all hover:border-stone-300 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600'
          >
            <span className='text-xs font-medium text-stone-500 uppercase'>
              {sortOptions.find((o) => o.id === sortBy)?.label || 'Сортировка'}
            </span>
            <svg
              className={`h-3 w-3 text-stone-500 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth='3'
            >
              <path
                d='M19 9l-7 7-7-7'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          {isSortOpen && (
            <div className='animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white py-2 shadow-xl shadow-stone-200/50 dark:border-stone-700 dark:bg-stone-800 dark:shadow-none'>
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id as SortOption);
                    setIsSortOpen(false);
                  }}
                  className={`w-full cursor-pointer px-5 py-3 text-left text-xs font-medium uppercase transition-colors ${
                    sortBy === option.id
                      ? 'text-blue-600 dark:text-amber-500'
                      : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
