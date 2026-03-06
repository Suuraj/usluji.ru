import {useEffect, useRef, useState} from 'react';
import {api} from '../../api';
import {Badge, Button, Card} from '../ui/Base';
import {useClickOutside} from '../../hooks/useClickOutside';
import type {Order, Profile} from '../../types';

export const PublicProfile = ({profileId, onOrderClick}: { profileId: string, onOrderClick: (id: string) => void }) => {
  const [data, setData] = useState<{ user: Profile, orders: Order[] } | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => setShowOfferModal(false));

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await api.getProfile(profileId);
        setData(profileData);

        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (token && currentUser.id && currentUser.id !== profileId) {
          const orders = await api.getOrders({lat: 55.75, lng: 37.61, radius: 1000000});
          setMyOrders(orders.filter(o => o.user_id === currentUser.id));
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
      alert('Заказ предложен!');
    } catch {
      alert('Ошибка при предложении заказа');
    }
  };

  if (loading) return <div
    className='py-20 text-center animate-pulse font-black uppercase text-stone-400 text-[10px] tracking-widest'>Загрузка...</div>;
  if (!data) return <div
    className='py-20 text-center font-black uppercase text-red-500 text-[10px] tracking-widest'>Профиль не найден</div>;

  const {user, orders} = data;
  const isMe = JSON.parse(localStorage.getItem('user') || '{}').id === profileId;

  return (
    <div className='max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 text-left pb-20'>
      <Card className='rounded-4xl p-10 mb-6'>
        <div
          className='flex flex-col items-center text-center border-b border-stone-100 dark:border-stone-800/50 pb-8 mb-8'>
          <div
            className='w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center font-black text-stone-400 uppercase select-none text-3xl border border-stone-200 dark:border-stone-700 mb-4 overflow-hidden'>
            {user.photo_url ? (
              <img src={user.photo_url} className='w-full h-full object-cover' alt=''/>
            ) : (
              <span className='opacity-40'>{user.name[0]}</span>
            )}
          </div>
          <h1 className='text-2xl font-black text-stone-900 dark:text-stone-100'>{user.name}</h1>
          <h2 className='text-blue-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2'>
            {user.role || 'Пользователь'}
          </h2>

          <div className='flex flex-wrap justify-center items-center gap-2 mt-6'>
            {user.address && (<Badge
              className='text-stone-500 bg-stone-50 border-stone-100 dark:bg-stone-800/50 dark:border-stone-700'>
              {user.address}</Badge>)}
            {user.rating && (<Badge icon='★' className='text-amber-500 border-amber-500/20 bg-amber-500/5'>
              {user.rating.toFixed(1)}</Badge>)}
            {user.tg_username && (
              <a href={`https://t.me/${user.tg_username}`} target='_blank' rel='noreferrer'
                 className='px-4 py-1.5 bg-[#2AABEE] text-white rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-500/20'>
                Telegram
              </a>
            )}
          </div>

          {!isMe && myOrders.length > 0 && (
            <Button onClick={() => setShowOfferModal(true)}
                    className='mt-8 px-10 py-3.5 shadow-xl shadow-blue-600/10 dark:shadow-amber-500/5'>
              Предложить работу
            </Button>
          )}
        </div>

        <div className='space-y-3 px-4'>
          <label className='text-[9px] uppercase text-stone-400 tracking-[0.2em] font-black'>О специалисте</label>
          <p className='text-base text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap font-medium'>
            {user.description || "Описание пока не заполнено."}
          </p>
        </div>
      </Card>

      <div className='space-y-4 px-2'>
        <h3 className='text-[9px] uppercase text-stone-400 tracking-[0.2em] font-black ml-4'>Актуальные заказы
          ({orders.length})</h3>
        <div className='grid gap-3'>
          {orders.map(order => (
            <Card key={order.id} onClick={() => onOrderClick(order.id)}
                  className='flex justify-between items-center group active:scale-[0.98]'>
              <div className='flex flex-col text-left'>
                <span
                  className='text-[9px] text-stone-400 mb-1 font-black uppercase tracking-widest'>{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                <h3
                  className='font-black text-stone-700 dark:text-stone-300 group-hover:text-blue-600 dark:group-hover:text-amber-500 transition-colors'>{order.title}</h3>
              </div>
              <div className='text-right shrink-0 ml-4'>
                {order.price && (<p className='font-black text-stone-700 dark:text-stone-300'>
                  {order.price.toLocaleString('ru-RU')} <span className='opacity-30'>₽</span></p>)}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {showOfferModal && (
        <div
          className='fixed inset-0 z-100 flex items-center justify-center p-6 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-300'>
          <div ref={modalRef} className='w-full max-w-md'>
            <Card className='p-8 rounded-4xl border-none shadow-2xl animate-in zoom-in-95 duration-200'>
              <h2
                className='text-lg font-black uppercase tracking-[0.15em] mb-8 text-center text-stone-800 dark:text-stone-200'>Ваши
                заказы</h2>
              <div className='space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar'>
                {myOrders.map(o => (
                  <div
                    key={o.id}
                    onClick={() => handleOffer(o.id)}
                    className='p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 hover:bg-blue-600 dark:hover:bg-amber-500 group cursor-pointer border border-stone-100 dark:border-stone-800 transition-all active:scale-[0.97]'
                  >
                    <p
                      className='font-black text-xs uppercase tracking-widest text-stone-600 dark:text-stone-400 group-hover:text-white dark:group-hover:text-stone-900 transition-colors'>
                      {o.title}
                    </p>
                  </div>
                ))}
              </div>
              <Button variant='ghost' onClick={() => setShowOfferModal(false)}
                      className='w-full mt-8 py-4 opacity-50 hover:opacity-100'>
                Закрыть
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
