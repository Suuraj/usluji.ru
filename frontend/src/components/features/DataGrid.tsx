import type {Order, Profile, TabType} from '../../types';
import {Badge, Card} from '../ui/Base';

interface DataGridProps {
  data: (Order | Profile)[];
  type: TabType;
  onReset: () => void;
  onOrderClick: (id: string) => void;
  onProfileClick: (id: string) => void;
}

export const DataGrid = ({data, type, onReset, onOrderClick, onProfileClick}: DataGridProps) => {
  if (data.length === 0) {
    return (
      <div
        className='text-center py-32 bg-white dark:bg-stone-900 rounded-4xl border border-stone-100 dark:border-stone-800 animate-in fade-in duration-500'>
        <p className='font-black text-xl text-stone-500'>Ничего не найдено</p>
        <button onClick={onReset}
                className='mt-6 text-xs font-medium text-blue-600 dark:text-amber-500 hover:opacity-70 cursor-pointer uppercase tracking-widest'>
          Сбросить фильтры
        </button>
      </div>
    );
  }

  return (
    <div className={type === 'orders' ? "grid gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
      {type === 'orders' ? (
        (data as Order[]).map(order => (
          <Card key={order.id} onClick={() => onOrderClick(order.id)}
                className='flex justify-between items-center group'>
            <div className='flex flex-col text-left'>
              <span className='text-xs text-stone-500 mb-1 font-medium tracking-widest'>
                {new Date(order.created_at).toLocaleDateString('ru-RU')}
              </span>
              <h3
                className='font-black text-stone-700 dark:text-stone-300 group-hover:text-blue-600 dark:group-hover:text-amber-500 transition-colors'>
                {order.title}
              </h3>
              {order.distance != null && (
                <span className='text-xs font-black text-stone-500 mt-1 flex gap-1'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                    <path d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'/>
                    <path d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'/>
                  </svg>
                  {Math.round(order.distance! / 1000)} км от Вас
                </span>
              )}
            </div>
            {order.price && (<div className='text-right shrink-0 ml-4'>
              <p className='font-black text-stone-700 dark:text-stone-300'>
                {order.price.toLocaleString('ru-RU')} <span className='opacity-50'>₽</span>
              </p>
            </div>)}
          </Card>
        ))
      ) : (
        (data as Profile[]).map(profile => (
          <Card key={profile.id} onClick={() => onProfileClick(profile.id)}
                className='flex flex-col items-center text-center p-8'>
            <div
              className='w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 border border-stone-200 dark:border-stone-700 mb-4 transition-transform group-hover:scale-110'>
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className='w-full h-full rounded-full object-cover'/>
              ) : (
                <span className='text-xl font-black opacity-40 select-none'>{profile.name.charAt(0)}</span>
              )}
            </div>
            <h3 className='font-black text-stone-700 dark:text-stone-300'>{profile.name}</h3>
            <p
              className='text-xs font-medium text-blue-600 dark:text-amber-500 mb-4 tracking-widest'>
              {profile.role || 'Пользователь'}
            </p>
            <div className='flex gap-2'>
              {profile.rating && (<Badge icon='★' className='text-amber-500 border-amber-500 bg-amber-500/5'>
                {profile.rating}
              </Badge>)}
              {profile.distance && (<Badge
                  className='text-stone-500 bg-stone-100 border-stone-200 dark:bg-stone-800 dark:border-stone-700'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                    <path d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'/>
                    <path d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'/>
                  </svg>
                  {Math.round(profile.distance! / 1000)} км
                </Badge>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
