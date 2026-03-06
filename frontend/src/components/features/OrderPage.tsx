import {useCallback, useEffect, useState} from 'react';
import {api} from '../../api';
import {Badge, Button, Card} from '../ui/Base';
import type {Order, Response} from '../../types';

const TelegramIcon = ({className = "w-9 h-9"}: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox='0 0 240 240'>
    <path
      d='M54.3,118.8c35-15.2,58.3-25.3,70-30.2 c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3 c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3 c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8 c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z'/>
  </svg>
);

export const OrderPage = ({orderId, user, onProfileClick}: {
  orderId: string,
  user: any,
  onProfileClick: (id: string) => void
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
        setHasResponded(myResps.some(r => r.order_id === orderId));
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

  const handleStatusUpdate = async (respId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.updateResponseStatus(respId, status);
      loadData();
    } catch {
      alert('Ошибка обновления');
    }
  };

  if (loading || !order) return (
    <div className='py-20 text-center animate-pulse font-black uppercase text-stone-400 tracking-widest text-[10px]'>
      Загрузка...
    </div>
  );

  const isOwner = user?.id === order.user_id;

  return (
    <div className='max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-500 text-left pb-20'>
      <Card
        className='rounded-4xl p-8 md:p-10 mb-8 border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-none'>
        <div className='flex items-center justify-between mb-8 pb-6 border-b border-stone-100 dark:border-stone-800/50'>
          <div onClick={() => onProfileClick(order.user_id)} className='flex items-center gap-4 cursor-pointer group'>
            <div
              className='w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center font-black text-stone-400 border border-stone-200 dark:border-stone-700 transition-all group-hover:border-blue-600 dark:group-hover:border-amber-500 overflow-hidden'>
              {order.photo_url ? <img src={order.photo_url} className='w-full h-full object-cover' alt=''/> :
                <span className='text-3xl opacity-40 uppercase font-black'>{order.user_name[0]}</span>}
            </div>
            <div>
              <p
                className='font-black text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-amber-500 text-xl tracking-tight transition-colors'>
                {order.user_name}
              </p>
              {order.user_rating && (
                <Badge icon='★' className='mt-1 text-amber-500 border-amber-500/20 bg-amber-500/5'>
                  {order.user_rating.toFixed(1)}
                </Badge>)}
            </div>
          </div>

          {order.tg_username && (
            <a href={`https://t.me/${order.tg_username}`} target='_blank' rel='noreferrer'
               className='w-14 h-14 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 rounded-full flex items-center justify-center hover:text-[#2AABEE] transition-all border border-stone-200 dark:border-stone-700 active:scale-90'>
              <TelegramIcon className='w-13 h-13'/>
            </a>
          )}
        </div>

        <div className='space-y-6'>
          <div className='flex justify-between items-start gap-4'>
            <h1
              className='text-3xl font-black text-stone-900 dark:text-stone-100 leading-none tracking-tight'>{order.title}</h1>
            {order.price && (<p className='text-2xl font-black text-blue-600 dark:text-amber-500 shrink-0'>
              {order.price.toLocaleString('ru-RU')} <span className='opacity-30 text-xl'>₽</span>
            </p>)}
          </div>
          {order.address && (<div
            className='flex items-center gap-2 text-stone-400 font-black text-[10px] bg-stone-50 dark:bg-stone-800/50 w-fit px-4 py-1.5 rounded-full border border-stone-100 dark:border-stone-800 uppercase tracking-widest'>
            <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='3'>
              <path d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'/>
              <path d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'/>
            </svg>
            {order.address}
          </div>)}
          <p className='text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap font-medium text-lg'>
            {order.description}</p>
        </div>

        {!isOwner && user && (
          <div className='mt-12 flex justify-center border-t border-stone-100 dark:border-stone-800/50 pt-10'>
            {hasResponded ? (
              <div
                className='px-12 py-4 bg-stone-100 dark:bg-stone-800 text-stone-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-stone-200 dark:border-stone-700'>Вы
                уже откликнулись</div>
            ) : (
              <Button onClick={handleRespond} className='px-16 py-5 shadow-2xl shadow-blue-600/20'>Откликнуться на
                заказ</Button>
            )}
          </div>
        )}
      </Card>

      {isOwner && (
        <div className='space-y-4 px-2'>
          <h3 className='text-[10px] uppercase text-stone-400 tracking-[0.2em] font-black ml-4'>Отклики
            ({responses.length})</h3>
          {responses.length > 0 ? (
            <div className='grid gap-3'>
              {responses.map(resp => (
                <Card key={resp.id}
                      className='flex items-center justify-between p-6 border-stone-100 dark:border-stone-800'>
                  <div onClick={() => onProfileClick(resp.user_id)}
                       className='flex items-center gap-4 cursor-pointer group'>
                    <div
                      className='w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 group-hover:border-blue-600 transition-all'>
                      {resp.photo_url ? <img src={resp.photo_url} className='w-full h-full object-cover' alt=''/> :
                        <div
                          className='w-full h-full flex items-center justify-center font-black text-stone-400 uppercase'>
                          {resp.user_name[0]}</div>}
                    </div>
                    <div>
                      <p
                        className='font-black text-stone-800 dark:text-stone-200 group-hover:text-blue-600 transition-colors'>
                        {resp.user_name}</p>
                      {resp.user_rating && (
                        <p className='text-[10px] font-black text-amber-500 uppercase tracking-widest'>
                          ★ {resp.user_rating.toFixed(1)}</p>)}
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    {resp.status === 'pending' ? (
                      <>
                        <Button variant='ghost' onClick={() => handleStatusUpdate(resp.id, 'rejected')}
                                className='px-4 py-2 hover:text-red-500'>Отклонить</Button>
                        <Button onClick={() => handleStatusUpdate(resp.id, 'accepted')}
                                className='px-6 py-2.5'>Принять</Button>
                      </>
                    ) : (
                      <Badge
                        className={`uppercase tracking-widest ${resp.status === 'accepted' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                        {resp.status === 'accepted' ? 'Принят' : 'Отклонен'}
                      </Badge>
                    )}
                    {resp.tg_username && (
                      <a href={`https://t.me/${resp.tg_username}`} target='_blank' rel='noreferrer'
                         className='w-10 h-10 bg-[#2AABEE] text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-md shadow-blue-500/20'>
                        <TelegramIcon className='w-9 h-9'/>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div
              className='py-12 text-center bg-stone-100/30 dark:bg-stone-800/20 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800'>
              <p className='text-stone-400 text-[10px] font-black uppercase tracking-widest'>Пока нет откликов</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
