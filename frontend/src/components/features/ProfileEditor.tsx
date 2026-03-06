import {useEffect, useState} from 'react';
import {TelegramAuth} from './TelegramAuth';
import {api} from '../../api';
import {Button, Card, Input} from '../ui/Base';

interface ProfileEditorProps {
  user: { id: string; name: string } | null;
  onAuth: (data: any) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ProfileEditor = ({user, onAuth, onLogout, isDarkMode, toggleTheme}: ProfileEditorProps) => {
  const [form, setForm] = useState({
    name: '',
    role: '' as string | null,
    description: '' as string | null,
    address: '' as string | null,
    lat: null as number | null,
    lng: null as number | null
  });

  useEffect(() => {
    if (user) {
      api.getProfile(user.id, true)
        .then(data => {
          setForm({
            name: data.user.name || '',
            role: data.user.role ?? null,
            description: data.user.description ?? null,
            address: data.user.address ?? null,
            lat: data.user.location?.lat ?? null,
            lng: data.user.location?.lng ?? null
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
        address: form.address?.trim() || null
      };
      await api.updateProfile(payload);
      alert('Изменения сохранены');
    } catch {
      alert('Ошибка при сохранении');
    }
  };

  if (!user) {
    return (
      <div className='max-w-md mx-auto mt-12 animate-in fade-in zoom-in-95 duration-300'>
        <Card className='rounded-4xl p-10 text-center'>
          <div
            className='w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600'>
            <svg viewBox='0 0 24 24' fill='none' className='w-10 h-10 stroke-current' strokeWidth='1.5'>
              <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/>
              <circle cx='12' cy='7' r='4'/>
            </svg>
          </div>
          <h2 className='text-xl font-black mb-6 tracking-tight uppercase'>Авторизация</h2>
          <div className='flex justify-center'>
            <TelegramAuth botName='UslujiBot' onAuth={onAuth}/>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500'>
      <Card className='rounded-4xl p-10'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-black tracking-widest uppercase'>Мой профиль</h2>
          <Button variant='secondary' onClick={toggleTheme} className='px-4 py-1 font-bold'>
            {isDarkMode ? 'Светлая тема' : 'Темная тема'}
          </Button>
        </div>

        <div className='border-t border-stone-100 dark:border-stone-800 pt-8 text-left space-y-6'>
          <Input
            label='Имя'
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <Input
            label='Специализация'
            value={form.role || ''}
            onChange={e => setForm({...form, role: e.target.value || null})}
          />
          <Input
            label='О себе'
            type='textarea'
            value={form.description || ''}
            onChange={e => setForm({...form, description: e.currentTarget.value || null})}
          />
          <Input
            label='Адрес'
            value={form.address || ''}
            onChange={e => setForm({...form, address: e.target.value || null})}
          />

          <div className='flex flex-col items-center gap-6 pt-6'>
            <Button onClick={handleSave} className='px-12 py-4'>Сохранить</Button>
            <Button variant='danger' onClick={onLogout}>Выйти</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
