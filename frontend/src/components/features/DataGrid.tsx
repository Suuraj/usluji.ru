import type { Order, Profile, TabType } from '../../types';
import { Badge, Card, LocationIcon } from '../ui/Base';
import { Avatar } from '../ui/Avatar';
import { formatDate, formatDistance, formatPrice } from '../../utils/format';

interface DataGridProps {
  data: (Order | Profile)[];
  type: TabType;
  onReset: () => void;
  onOrderClick: (id: string) => void;
  onProfileClick: (id: string) => void;
}

export const DataGrid = ({
  data,
  type,
  onReset,
  onOrderClick,
  onProfileClick,
}: DataGridProps) => {
  if (data.length === 0) {
    return (
      <div className='animate-in fade-in zoom-in-95 rounded-4xl border border-stone-100 bg-white py-32 text-center duration-500 dark:border-stone-800 dark:bg-stone-900'>
        <p className='text-xl font-black text-stone-500'>Ничего не найдено</p>
        <button
          onClick={onReset}
          className='mt-6 cursor-pointer text-xs font-medium tracking-widest text-blue-600 uppercase transition-opacity hover:opacity-70 dark:text-amber-500'
        >
          Сбросить фильтры
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        type === 'orders'
          ? 'grid gap-3'
          : 'grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3'
      }
    >
      {type === 'orders'
        ? (data as Order[]).map((order) => (
            <Card
              key={order.id}
              onClick={() => onOrderClick(order.id)}
              className='group flex items-center justify-between'
            >
              <div className='flex flex-col text-left'>
                <span className='mb-1 text-xs font-medium tracking-widest text-stone-500'>
                  {formatDate(order.created_at)}
                </span>
                <h3 className='font-black text-stone-700 transition-colors group-hover:text-blue-600 dark:text-stone-300 dark:group-hover:text-amber-500'>
                  {order.title}
                </h3>
                {order.distance != null && (
                  <span className='mt-1 flex gap-1 text-xs font-black text-stone-500'>
                    <LocationIcon />
                    {formatDistance(order.distance)} от Вас
                  </span>
                )}
              </div>
              {order.price != null && (
                <div className='ml-4 shrink-0 text-right'>
                  <p className='font-black text-stone-700 dark:text-stone-300'>
                    {formatPrice(order.price)}
                  </p>
                </div>
              )}
            </Card>
          ))
        : (data as Profile[]).map((profile) => (
            <Card
              key={profile.id}
              onClick={() => onProfileClick(profile.id)}
              className='group flex flex-col items-center p-8 text-center'
            >
              <Avatar
                src={profile.photo_url}
                name={profile.name}
                className='mb-4 h-16 w-16 text-2xl group-hover:border-blue-600 dark:group-hover:border-amber-500'
              />
              <h3 className='font-black text-stone-700 dark:text-stone-300'>
                {profile.name}
              </h3>
              <p className='mb-4 text-xs font-medium tracking-widest text-blue-600 dark:text-amber-500'>
                {profile.role || 'Пользователь'}
              </p>
              <div className='flex gap-2'>
                {profile.rating != null && (
                  <Badge className='border-amber-500 bg-amber-500/5 text-amber-500'>
                    ★ {profile.rating.toFixed(1)}
                  </Badge>
                )}
                {profile.distance != null && (
                  <Badge className='border-stone-200 bg-stone-100 text-stone-500 dark:border-stone-700 dark:bg-stone-800'>
                    <LocationIcon />
                    {formatDistance(profile.distance)}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
    </div>
  );
};
