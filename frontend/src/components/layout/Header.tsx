interface HeaderProps {
  user: { id: string; name: string; photo_url?: string | null } | null;
  setCurrentPage: (page: string) => void;
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = ({user, setCurrentPage, showSearch, searchQuery, setSearchQuery}: HeaderProps) => {
  return (
    <header
      className='sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 transition-colors duration-300'>
      <div className='max-w-3xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4'>
        <div
          onClick={() => setCurrentPage('main')}
          className='text-2xl font-black tracking-tighter text-blue-600 dark:text-amber-500 shrink-0 select-none cursor-pointer hover:opacity-80 transition-opacity'
        >
          УСЛУЖИ
        </div>

        <div className='flex-1 max-w-md'>
          {showSearch && (
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Поиск'
              className='w-full bg-stone-100 dark:bg-stone-800 border-none rounded-full py-2 px-5 focus:bg-stone-200 dark:focus:bg-stone-700 focus:ring-1 focus:ring-blue-600 dark:focus:ring-amber-500 transition-all outline-none font-bold'
            />
          )}
        </div>

        <button
          onClick={() => setCurrentPage('profile')}
          className='w-10 h-10 rounded-full bg-blue-600 dark:bg-stone-800 text-white dark:text-amber-500 flex items-center justify-center font-bold shrink-0 hover:scale-105 active:scale-95 cursor-pointer transition-all overflow-hidden'
        >
          {user ? (
            user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.name}
                className='w-full h-full object-cover'
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <span className='select-none uppercase font-black'>
                {user.name.charAt(0)}
              </span>
            )
          ) : (
            <svg viewBox='0 0 24 24' fill='none' className='w-5 h-5 stroke-current' strokeWidth='2.5'>
              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' strokeLinecap='round'/>
              <circle cx='12' cy='7' r='4'/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
