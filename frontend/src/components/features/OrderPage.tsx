import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import { Badge, Button, Card, LocationIcon, TelegramIcon } from '../ui/Base';
import { Avatar } from '../ui/Avatar';
import { formatPrice } from '../../utils/format';
import type { Order, Response } from '../../types';

export const OrderPage = ({
  orderId,
  user,
  onProfileClick,
}: {
  orderId: string;
  user: { id: string; name: string } | null;
  onProfileClick: (id: string) => void;
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [hasResponded, setHasResponded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);

      if (user?.id === data.user_id) {
        const resps = await api.getOrderResponses(orderId);
        setResponses(resps || []);
      } else if (user) {
        const myResps = await api.getMyResponses();
        setHasResponded(myResps.some((r) => r.order_id === orderId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async () => {
    try {
      await api.respondToOrder(orderId);
      setHasResponded(true);
    } catch {
      alert('Ошибка при отклике');
    }
  };

  const handleStatusUpdate = async (
    respId: string,
    status: 'accepted' | 'rejected',
  ) => {
    try {
      await api.updateResponseStatus(respId, status);
      loadData();
    } catch {
      alert('Ошибка обновления');
    }
  };

  if (loading || !order)
    return (
      <div className='animate-pulse py-20 text-center text-sm font-black tracking-widest text-stone-500 uppercase'>
        Загрузка...
      </div>
    );

  const isOwner = user?.id === order.user_id;

  return (
    <div className='mx-auto max-w-3xl pb-20 text-left'>
      <Card className='mb-6 rounded-4xl p-10'>
        <div className='mb-6 flex items-center justify-between border-b border-stone-100 pb-6 dark:border-stone-800'>
          <div
            onClick={() => onProfileClick(order.user_id)}
            className='group flex cursor-pointer items-center gap-4'
          >
            <Avatar
              src={order.photo_url}
              name={order.user_name}
              className='h-16 w-16 text-2xl'
            />
            <div>
              <p className='text-xl font-black tracking-tight text-stone-700 transition-colors group-hover:text-blue-600 dark:text-stone-300 dark:group-hover:text-amber-500'>
                {order.user_name}
              </p>
              <div className='mt-1 flex items-center gap-1'>
                {order.user_rating != null && (
                  <Badge className='border-amber-500/20 bg-amber-500/5 text-amber-500'>
                    ★ {order.user_rating.toFixed(1)}
                  </Badge>
                )}
                {order.address && (
                  <Badge className='border-stone-100 bg-stone-50 text-stone-500 dark:border-stone-800 dark:bg-stone-800/50'>
                    <LocationIcon />
                    {order.address}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {order.tg_username && (
            <a
              href={`https://t.me/${order.tg_username}`}
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
              {order.title}
            </h1>
            {order.price != null && (
              <p className='shrink-0 text-blue-600 dark:text-amber-500'>
                {formatPrice(order.price)}
              </p>
            )}
          </div>

          <p className='text-lg leading-relaxed font-medium whitespace-pre-wrap text-stone-500'>
            {order.description}
          </p>
        </div>

        {!isOwner && user && (
          <div className='mt-6 flex justify-center border-t border-stone-100 pt-6 dark:border-stone-800'>
            <Button
              onClick={handleRespond}
              className='px-12 py-4'
              isDisabled={hasResponded}
            >
              {hasResponded ? 'Вы уже откликнулись' : 'Откликнуться'}
            </Button>
          </div>
        )}
      </Card>

      {isOwner && (
        <div className='space-y-4 px-2'>
          <h3 className='ml-4 text-xs font-medium tracking-widest text-stone-500 uppercase'>
            Отклики ({responses.length})
          </h3>
          {responses.length > 0 ? (
            <div className='grid gap-3'>
              {responses.map((resp) => (
                <Card
                  key={resp.id}
                  className='flex items-center justify-between border-stone-100 p-6 dark:border-stone-800'
                >
                  <div
                    onClick={() => onProfileClick(resp.user_id)}
                    className='group flex cursor-pointer items-center gap-4'
                  >
                    <Avatar
                      src={resp.photo_url}
                      name={resp.user_name}
                      className='h-12 w-12 text-lg'
                    />
                    <div>
                      <p className='font-black text-stone-700 transition-colors group-hover:text-blue-600 dark:text-stone-300 dark:group-hover:text-amber-500'>
                        {resp.user_name}
                      </p>
                      {resp.user_rating != null && (
                        <p className='text-xs font-medium tracking-widest text-amber-500 uppercase'>
                          ★ {resp.user_rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    {resp.status === 'pending' ? (
                      <>
                        <Button
                          variant='danger'
                          onClick={() =>
                            handleStatusUpdate(resp.id, 'rejected')
                          }
                        >
                          Отклонить
                        </Button>
                        <Button
                          onClick={() =>
                            handleStatusUpdate(resp.id, 'accepted')
                          }
                          className='px-4 py-2'
                        >
                          Принять
                        </Button>
                      </>
                    ) : (
                      <Badge
                        className={`tracking-widest uppercase ${
                          resp.status === 'accepted'
                            ? 'border-green-500/20 bg-green-500/5 text-green-500'
                            : 'border-red-500/20 bg-red-500/5 text-red-500'
                        }`}
                      >
                        {resp.status === 'accepted' ? 'Принят' : 'Отклонен'}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-stone-200 bg-stone-100/30 py-10 text-center dark:border-stone-800 dark:bg-stone-800/20'>
              <p className='text-xs font-black tracking-widest text-stone-500 uppercase'>
                Откликов нет
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
