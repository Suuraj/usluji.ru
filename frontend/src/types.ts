export type TabType = 'orders' | 'profiles';
export type SortOption = 'date' | 'price_asc' | 'price_desc' | 'rating' | 'distance';

export interface GeoPoint {
  lat: number | null;
  lng: number | null;
}

export interface Profile {
  id: string;
  name: string;
  role?: string | null;
  description?: string | null;
  photo_url?: string | null;
  address?: string | null;
  location?: GeoPoint | null;
  distance?: number | null;
  rating?: number | null;
  tg_username?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  user_rating?: number | null;
  photo_url?: string | null;
  tg_username?: string | null;
  title: string;
  description: string;
  price?: number | null;
  address?: string | null;
  location?: GeoPoint | null;
  distance?: number | null;
  created_at: string;
}

export interface Response {
  id: string;
  order_id: string;
  order_title: string;
  user_id: string;
  user_name: string;
  user_rating?: number | null;
  photo_url?: string | null;
  tg_username?: string | null;
  type: 'apply' | 'offer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
