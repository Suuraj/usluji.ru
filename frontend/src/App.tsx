import { useEffect, useMemo, useState } from 'react';
import type { Order, Profile, SortOption, TabType } from './types';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DataGrid } from './components/features/DataGrid';
import { ProfileEditor } from './components/features/ProfileEditor';
import { OrderPage } from './components/features/OrderPage';
import { PublicProfile } from './components/features/PublicProfile';
import { CreateOrder } from './components/features/CreateOrder';
import { api } from './api';

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, handleAuth, handleLogout } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  const activeTab: TabType = path.startsWith('/orders') ? 'orders' : 'profiles';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    orders: SortOption;
    profiles: SortOption;
  }>(() => {
    const saved = localStorage.getItem('sort_config');
    return saved ? JSON.parse(saved) : { orders: 'date', profiles: 'rating' };
  });

  useEffect(() => {
    localStorage.setItem('sort_config', JSON.stringify(sortConfig));
  }, [sortConfig]);

  const currentSort = sortConfig[activeTab];

  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const isMainList = path === '/orders' || path === '/profiles';
    if (!isMainList) return;

    const fetchData = async () => {
      try {
        if (activeTab === 'orders') {
          const data = await api.getOrders({
            lat: 55.75,
            lng: 37.61,
            radius: 50000,
          });
          setOrders(data || []);
        } else {
          const data = await api.getProfiles({
            lat: 55.75,
            lng: 37.61,
            radius: 50000,
          });
          setProfiles(data || []);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      }
    };
    fetchData();
  }, [path, activeTab]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const data = activeTab === 'orders' ? orders : profiles;
    const result = data.filter((item) => {
      const searchField = 'title' in item ? item.title : item.name;
      return searchField.toLowerCase().includes(query);
    });

    return [...result].sort((a, b) => {
      if (activeTab === 'orders') {
        const oA = a as Order;
        const oB = b as Order;
        if (currentSort === 'price_asc')
          return (oA.price ?? 0) - (oB.price ?? 0);
        if (currentSort === 'price_desc')
          return (oB.price ?? 0) - (oA.price ?? 0);
        return (
          new Date(oB.created_at).getTime() - new Date(oA.created_at).getTime()
        );
      }
      const pA = a as Profile;
      const pB = b as Profile;
      return (pB.rating ?? 0) - (pA.rating ?? 0);
    });
  }, [searchQuery, activeTab, currentSort, orders, profiles]);

  if (path === '/') {
    window.history.replaceState({}, '', '/orders');
    setPath('/orders');
    return null;
  }

  const renderContent = () => {
    const segments = path.split('/').filter(Boolean);
    const [root, id] = segments;

    if (path === '/orders' || path === '/profiles') {
      return (
        <DataGrid
          data={filteredData}
          type={activeTab}
          onReset={() => setSearchQuery('')}
          onOrderClick={(orderId) => navigate(`/order/${orderId}`)}
          onProfileClick={(profileId) => navigate(`/profile/${profileId}`)}
        />
      );
    }

    if (!user || path === '/profile')
      return (
        <ProfileEditor
          user={user}
          onAuth={handleAuth}
          onLogout={() => {
            handleLogout();
            navigate('/orders');
          }}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      );

    if (path === '/create')
      return <CreateOrder onCreated={(newId) => navigate(`/order/${newId}`)} />;

    if (root === 'order' && id)
      return (
        <OrderPage
          orderId={id}
          user={user}
          onProfileClick={(pId) => navigate(`/profile/${pId}`)}
        />
      );

    if (root === 'profile' && id)
      return (
        <PublicProfile
          profileId={id}
          onOrderClick={(oId) => navigate(`/order/${oId}`)}
        />
      );

    return (
      <div className='flex items-center justify-center py-32 text-6xl font-black opacity-10 select-none'>
        404
      </div>
    );
  };

  const isMainPage = path === '/orders' || path === '/profiles';

  return (
    <div className='min-h-screen bg-stone-50 pb-24 font-sans text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-200'>
      <Header
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={(p) =>
          p === 'main' ? navigate('/orders') : navigate(`/${p}`)
        }
        showSearch={isMainPage}
      />

      {isMainPage && (
        <Navigation
          activeTab={activeTab}
          setActiveTab={(t) =>
            navigate(t === 'orders' ? '/orders' : '/profiles')
          }
          sortBy={currentSort}
          setSortBy={(newSort) =>
            setSortConfig((prev) => ({ ...prev, [activeTab]: newSort }))
          }
        />
      )}

      <main className='mx-auto max-w-3xl p-4 md:p-6'>{renderContent()}</main>

      {user && path === '/orders' && (
        <button
          onClick={() => navigate('/create')}
          className='fixed right-8 bottom-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:scale-105 active:scale-95 dark:bg-amber-500 dark:text-stone-900'
        >
          <svg
            className='h-7 w-7'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth='3'
          >
            <path
              d='M12 5v14M5 12h14'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      )}
    </div>
  );
}
