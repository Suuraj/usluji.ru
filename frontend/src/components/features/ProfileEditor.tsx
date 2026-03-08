import { useEffect, useState } from 'react';
import { TelegramAuth } from './TelegramAuth';
import { api } from '../../api';
import { Button, Card, Input, ProfileIcon } from '../ui/Base';

interface ProfileEditorProps {
  user: { id: string; name: string } | null;
  onAuth: (data: any) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ProfileEditor = ({
  user,
  onAuth,
  onLogout,
  isDarkMode,
  toggleTheme,
}: ProfileEditorProps) => {
  const [form, setForm] = useState({
    name: '',
    role: '' as string | null,
    description: '' as string | null,
    address: '' as string | null,
    lat: null as number | null,
    lng: null as number | null,
  });

  useEffect(() => {
    if (user) {
      api
        .getProfile(user.id, true)
        .then((data) => {
          setForm({
            name: data.profile.name || '',
            role: data.profile.role ?? null,
            description: data.profile.description ?? null,
            address: data.profile.address ?? null,
            lat: data.profile.location?.lat ?? null,
            lng: data.profile.location?.lng ?? null,
          });
        })
        .catch(console.error);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        role: form.role?.trim() || null,
        description: form.description?.trim() || null,
        address: form.address?.trim() || null,
      };
      await api.updateProfile(payload);
      alert('Изменения сохранены');
    } catch {
      alert('Ошибка при сохранении');
    }
  };

  if (!user) {
    return (
      <div className='mx-auto mt-12 max-w-md'>
        <Card className='rounded-4xl p-10 text-center'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800'>
            <ProfileIcon className='h-10 w-10' />
          </div>
          <h2 className='mb-6 text-xl font-bold uppercase'>Авторизация</h2>
          <div className='flex justify-center'>
            <TelegramAuth onAuth={onAuth} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl'>
      <Card className='rounded-4xl p-10'>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-black tracking-widest uppercase'>
            Мой профиль
          </h2>
          <Button
            variant='secondary'
            onClick={toggleTheme}
            className='px-4 py-1 font-bold'
          >
            {isDarkMode ? 'Светлая тема' : 'Темная тема'}
          </Button>
        </div>

        <div className='space-y-6 border-t border-stone-100 pt-6 text-left dark:border-stone-800'>
          <Input
            label='Имя'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label='Специализация'
            value={form.role || ''}
            onChange={(e) => setForm({ ...form, role: e.target.value || null })}
          />
          <Input
            label='О себе'
            type='textarea'
            value={form.description || ''}
            onChange={(e) =>
              setForm({ ...form, description: e.currentTarget.value || null })
            }
          />
          <Input
            label='Адрес'
            value={form.address || ''}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value || null })
            }
          />

          <div className='flex flex-col items-center gap-6 pt-4'>
            <Button onClick={handleSave} className='px-12 py-4'>
              Сохранить
            </Button>
            <Button variant='danger' onClick={onLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
