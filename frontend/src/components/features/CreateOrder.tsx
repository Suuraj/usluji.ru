import { useState } from 'react';
import { api } from '../../api';
import { Button, Card, Input } from '../ui/Base';

export const CreateOrder = ({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '' as string | null,
    price: null as number | null,
    lat: null as number | null,
    lng: null as number | null,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setError('Заполните название и описание');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        address: form.address?.trim() || null,
        price: form.price && form.price > 0 ? form.price : null,
      };

      const data = await api.createOrder(payload);
      if (data?.id) {
        onCreated(data.id);
      } else {
        throw new Error();
      }
    } catch {
      setError('Не удалось создать заказ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setForm({ ...form, price: val === '' ? null : parseInt(val, 10) });
  };

  return (
    <div className='mx-auto max-w-3xl text-left'>
      <Card className='rounded-4xl p-10'>
        <div className='mb-6 flex items-end justify-between'>
          <h2 className='text-xl font-black tracking-widest text-stone-700 uppercase dark:text-stone-300'>
            Новый заказ
          </h2>
          {error && (
            <p className='mb-1 animate-pulse text-xs font-black tracking-widest text-red-500 uppercase'>
              {error}
            </p>
          )}
        </div>

        <div className='space-y-6 border-t border-stone-100 pt-6 dark:border-stone-800'>
          <Input
            label='Что нужно сделать?'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Input
              label='Бюджет (₽)'
              inputMode='numeric'
              value={form.price ?? ''}
              onChange={handlePriceChange}
            />
            <Input
              label='Адрес'
              value={form.address || ''}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value || null })
              }
            />
          </div>

          <Input
            label='Подробности'
            type='textarea'
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: (e.target as HTMLTextAreaElement).value,
              })
            }
          />

          <div className='flex justify-center pt-4'>
            <Button
              onClick={handleSubmit}
              isDisabled={isSubmitting}
              className='px-12 py-4'
            >
              Опубликовать
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
