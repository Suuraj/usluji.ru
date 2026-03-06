import {useMemo, useRef, useState} from 'react';
import type {SortOption, TabType} from '../../types';
import {useClickOutside} from '../../hooks/useClickOutside';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const Navigation = ({activeTab, setActiveTab, sortBy, setSortBy}: NavigationProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setIsSortOpen(false));

  const sortOptions = useMemo(() => {
    if (activeTab === 'orders') {
      return [
        {id: 'date', label: 'Новые'},
        {id: 'price_asc', label: 'Дешевые'},
        {id: 'price_desc', label: 'Дорогие'},
        {id: 'distance', label: 'Поблизости'},
      ] as const;
    }
    return [
      {id: 'rating', label: 'По рейтингу'},
      {id: 'distance', label: 'Поблизости'},
    ] as const;
  }, [activeTab]);

  return (
    <div className='bg-white border-stone-100 dark:bg-stone-900 dark:border-stone-800 border-b transition-colors'>
      <div className='max-w-3xl mx-auto flex px-4 md:px-6 justify-between items-center relative h-14'>
        <div className='flex gap-2 h-full'>
          {(['orders', 'profiles'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full px-4 text-xs font-black uppercase cursor-pointer tracking-widest transition-all relative
                ${activeTab === tab
                ? 'text-blue-600 dark:text-amber-500'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
            >
              {tab === 'orders' ? 'Заказы' : 'Профили'}
              {activeTab === tab && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-amber-500 rounded-t-full'/>
              )}
            </button>
          ))}
        </div>

        <div ref={menuRef} className='relative'>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-all active:scale-95'
          >
            <span className='text-[9px] font-black uppercase tracking-widest text-stone-500'>
              {sortOptions.find(o => o.id === sortBy)?.label || 'Сортировка'}
            </span>
            <svg
              className={`w-3 h-3 text-stone-500 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}
              fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='3'
            >
              <path d='M19 9l-7 7-7-7' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </button>

          {isSortOpen && (
            <div
              className='absolute right-0 mt-2 w-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150'>
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id as SortOption);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-colors
                    ${sortBy === option.id
                    ? 'text-blue-600 dark:text-amber-500'
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
