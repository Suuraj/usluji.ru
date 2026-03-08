import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import { Badge, Button, Card, LocationIcon, TelegramIcon } from '../ui/Base';
import { Avatar } from '../ui/Avatar';
import { useClickOutside } from '../../hooks/useClickOutside';
import { formatDate, formatPrice } from '../../utils/format';
import type { Order, Profile } from '../../types';

export const PublicProfile = ({
  profileId,
  onOrderClick,
}: {
  profileId: string;
  onOrderClick: (id: string) => void;
}) => {
  const [data, setData] = useState<{
    profile: Profile;
    orders: Order[];
  } | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setShowOfferModal(false));

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getProfile(profileId);
        setData(res);

        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (token && currentUser.id && currentUser.id !== profileId) {
          const orders = await api.getOrders({
            lat: 55.75,
            lng: 37.61,
            radius: 1000000,
          });
          setMyOrders(orders.filter((o) => o.user_id === currentUser.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [profileId]);

  const handleOffer = async (orderId: string) => {
    try {
      await api.offerToUser(profileId, orderId);
      setShowOfferModal(false);
      alert('Заказ предложен');
    } catch {
      alert('Ошибка при предложении заказа');
    }
  };

  if (loading || !data)
    return (
      <div className='animate-pulse py-20 text-center text-sm font-black tracking-widest text-stone-500 uppercase'>
        {loading ? 'Загрузка...' : 'Профиль не найден'}
      </div>
    );

  const { profile, orders } = data;
  const isMe =
    JSON.parse(localStorage.getItem('user') || '{}').id === profileId;

  return (
    <div className='mx-auto max-w-3xl pb-20 text-left'>
      <Card className='mb-6 rounded-4xl p-10'>
        <div className='mb-6 flex items-center justify-between border-b border-stone-100 pb-6 dark:border-stone-800'>
          <div className='flex items-center gap-4'>
            <Avatar
              src={profile.photo_url}
              name={profile.name}
              className='h-16 w-16 text-2xl'
            />
            <div>
              <p className='text-xl font-black text-stone-700 dark:text-stone-300'>
                {profile.name}
              </p>
              <div className='mt-1 flex items-center gap-1'>
                {profile.rating != null && (
                  <Badge className='border-amber-500/20 bg-amber-500/5 text-amber-500'>
                    ★ {profile.rating.toFixed(1)}
                  </Badge>
                )}
                {profile.address && (
                  <Badge className='border-stone-100 bg-stone-50 text-stone-500 dark:border-stone-800 dark:bg-stone-800/50'>
                    <LocationIcon />
                    {profile.address}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {profile.tg_username && (
            <a
              href={`https://t.me/${profile.tg_username}`}
              target='_blank'
              rel='noreferrer'
              className='rounded-full border border-stone-200 bg-stone-100 text-stone-500 transition-all hover:border-blue-600 hover:text-[#2AABEE] active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-500'
            >
              <TelegramIcon className='h-14 w-14' />
            </a>
          )}
        </div>

        <div className='space-y-6'>
          <div className='flex items-start justify-between gap-4 text-2xl font-black'>
            <h1 className='text-stone-900 dark:text-stone-100'>
              {profile.role || 'Пользователь'}
            </h1>
          </div>

          <p className='text-lg leading-relaxed font-medium whitespace-pre-wrap text-stone-500'>
            {profile.description || 'Описание не заполнено.'}
          </p>
        </div>

        {!isMe && myOrders.length > 0 && (
          <div className='mt-6 flex justify-center border-t border-stone-100 pt-6 dark:border-stone-800'>
            <Button
              onClick={() => setShowOfferModal(true)}
              className='px-12 py-4'
            >
              Предложить заказ
            </Button>
          </div>
        )}
      </Card>

      <div className='space-y-4 px-2'>
        <h3 className='ml-4 text-xs font-medium tracking-widest text-stone-500 uppercase'>
          Актуальные заказы ({orders?.length ?? 0})
        </h3>
        <div className='grid gap-3'>
          {orders?.map((order) => (
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
              </div>
              {order.price != null && (
                <div className='ml-4 shrink-0 text-right'>
                  <p className='font-black text-stone-700 dark:text-stone-300'>
                    {formatPrice(order.price)}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {showOfferModal && (
        <div className='animate-in fade-in fixed inset-0 z-100 flex items-center justify-center bg-stone-950/60 backdrop-blur-md'>
          <div ref={modalRef} className='w-full max-w-md p-4'>
            <Card className='rounded-4xl border-none'>
              <h2 className='mb-4 text-center text-lg font-black tracking-widest text-stone-800 uppercase dark:text-stone-200'>
                Ваши заказы
              </h2>
              <div className='custom-scrollbar max-h-[50vh] space-y-2 overflow-y-auto pr-2'>
                {myOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleOffer(o.id)}
                    className='group cursor-pointer rounded-2xl border border-stone-100 bg-stone-50 p-5 transition-all hover:bg-blue-600 active:scale-95 dark:border-stone-800 dark:bg-stone-800/50 dark:hover:bg-amber-500'
                  >
                    <p className='text-xs font-black tracking-widest text-stone-500 uppercase transition-colors group-hover:text-white dark:group-hover:text-stone-900'>
                      {o.title}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                variant='secondary'
                onClick={() => setShowOfferModal(false)}
                className='mt-6 w-full py-4'
              >
                Закрыть
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
