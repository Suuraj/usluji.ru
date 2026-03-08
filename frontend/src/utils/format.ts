export const formatPrice = (price: number | null | undefined): string | null => {
  if (price == null) return null;
  return `${price.toLocaleString('ru-RU')} ₽`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

export const formatDistance = (meters: number | null | undefined): string | null => {
  if (meters == null) return null;
  const km = Math.round(meters / 1000);
  return `${km} км`;
};
