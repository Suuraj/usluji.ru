import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { useMemo } from 'react';
import type { Order, Profile } from '../../types';

interface MapPageProps {
  orders: Order[];
  profiles: Profile[];
  searchQuery: string;
}

export const MapPage = ({
  orders,
  profiles,
  searchQuery,
}: MapPageProps) => {
  // Дефолтцентр (Москва), если у пользователей нет координат
  const center = [55.75, 37.61];

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) => o.location?.lat && o.location?.lng && o.title.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) => p.location?.lat && p.location?.lng && p.name.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  return (
    <div className='h-[70vh] min-h-[400px] w-full overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-colors dark:border-stone-800 dark:bg-stone-900'>
      <YMaps>
        <Map
          defaultState={{ center, zoom: 11 }}
          width='100%'
          height='100%'
          modules={['templateLayoutFactory', 'layout.ImageWithContent']}
        >
          <ZoomControl options={{ position: { right: 10, top: 108 } }} />
          <GeolocationControl options={{ position: { right: 10, top: 10 } }} />

          {/* Маркеры Заказов (Синие) */}
          {filteredOrders.map((order) => (
            <Placemark
              key={`order-${order.id}`}
              geometry={[order.location!.lat, order.location!.lng]}
              modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
              properties={{
                hintContent: `Заказ: ${order.title}`,
                balloonContent: `
                  <div style="padding: 4px; font-family: sans-serif; color: #000;">
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">${order.title}</div>
                    <div style="font-size: 13px; margin-bottom: 12px; color: #666;">Создан: ${new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                    <a href="/order/${order.id}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">Открыть заказ</a>
                  </div>
                `,
              }}
              options={{
                preset: 'islands#blueDotIcon',
              }}
            />
          ))}

          {/* Маркеры Профилей (Оранжевые) */}
          {filteredProfiles.map((profile) => (
            <Placemark
              key={`profile-${profile.id}`}
              geometry={[profile.location!.lat, profile.location!.lng]}
              modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
              properties={{
                hintContent: `Исполнитель: ${profile.name}`,
                balloonContent: `
                  <div style="padding: 4px; font-family: sans-serif; color: #000;">
                    <div style="font-weight: bold; font-size: 15px; margin-bottom: 2px;">${profile.name}</div>
                    <div style="font-size: 13px; margin-bottom: 4px; color: #444;">${profile.role || 'Без специализации'}</div>
                    <div style="color: #f59e0b; font-size: 14px; font-weight: bold; margin-bottom: 12px;">⭐ ${profile.rating ? profile.rating.toFixed(1) : 'Нет оценок'}</div>
                    <a href="/profile/${profile.id}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">Посмотреть профиль</a>
                  </div>
                `,
              }}
              options={{
                preset: 'islands#orangeDotIcon',
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
};
