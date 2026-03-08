import { Avatar } from '../ui/Avatar';
import { ProfileIcon } from '../ui/Base.tsx';

interface HeaderProps {
  user: { id: string; name: string; photo_url?: string | null } | null;
  setCurrentPage: (page: string) => void;
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header = ({
  user,
  setCurrentPage,
  showSearch,
  searchQuery,
  setSearchQuery,
}: HeaderProps) => {
  return (
    <header className='sticky top-0 z-50 border-b border-stone-100 bg-white/80 backdrop-blur-md transition-colors dark:border-stone-800 dark:bg-stone-900/80'>
      <div className='mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 md:px-6'>
        <div
          onClick={() => setCurrentPage('main')}
          className='shrink-0 cursor-pointer text-2xl font-black tracking-tighter text-blue-600 transition-opacity select-none hover:opacity-80 dark:text-amber-500'
        >
          УСЛУЖИ
        </div>

        <div className='max-w-md flex-1'>
          {showSearch && (
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Поиск'
              className='w-full rounded-full border-none bg-stone-100 px-5 py-2 font-bold transition-all outline-none focus:bg-stone-200 focus:ring-1 focus:ring-blue-600 dark:bg-stone-800 dark:focus:bg-stone-700 dark:focus:ring-amber-500'
            />
          )}
        </div>

        <button
          onClick={() => setCurrentPage('profile')}
          className='group cursor-pointer'
        >
          {user ? (
            <Avatar
              src={user.photo_url}
              name={user.name}
              className='h-10 w-10 border border-transparent group-hover:border-blue-600 dark:group-hover:border-amber-500'
            />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-stone-100 text-blue-600 transition-all group-hover:border-blue-600 dark:bg-stone-800 dark:text-amber-500 dark:group-hover:border-amber-500'>
              <ProfileIcon />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
