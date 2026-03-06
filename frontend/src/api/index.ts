import type {Order, Profile, Response} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const fetcher = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && {'Authorization': `Bearer ${token}`}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {...options, headers});
  if (!res.ok) {
    const error = await res.json().catch(() => ({error: 'Unknown error'}));
    throw new Error(error.error || 'Server error');
  }
  return res.headers.get("content-length") === "0" ? null : res.json();
};

export const api = {
  auth: (tgData: any) => fetcher('/auth', {method: 'POST', body: JSON.stringify(tgData)}),

  getOrders: (params: { lat: number; lng: number; radius: number; page?: number }): Promise<Order[]> =>
    fetcher(`/orders?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}&page=${params.page || 1}`),

  getOrder: (id: string): Promise<Order> => fetcher(`/orders/${id}`),

  createOrder: (data: Partial<Order>) =>
    fetcher('/orders', {method: 'POST', body: JSON.stringify(data)}),

  respondToOrder: (id: string) => fetcher(`/orders/${id}/respond`, {method: 'POST'}),

  getProfiles: (params: { lat: number; lng: number; radius: number; page?: number }): Promise<Profile[]> =>
    fetcher(`/profiles?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}&page=${params.page || 1}`),

  getProfile: (id: string, hideOrders = false): Promise<{ user: Profile; orders: Order[] }> =>
    fetcher(`/profiles/${id}${hideOrders ? '?hide_orders=true' : ''}`),

  updateProfile: (data: Partial<Profile>) =>
    fetcher('/profile', {method: 'PUT', body: JSON.stringify(data)}),

  offerToUser: (profileId: string, orderId: string) =>
    fetcher(`/profiles/${profileId}/offer`, {method: 'POST', body: JSON.stringify({order_id: orderId})}),

  getMyResponses: (): Promise<Response[]> => fetcher('/my/responses'),
  getMyOffers: (): Promise<Response[]> => fetcher('/my/offers'),
  getOrderResponses: (id: string): Promise<Response[]> => fetcher(`/orders/${id}/responses`),

  updateResponseStatus: (id: string, status: 'accepted' | 'rejected') =>
    fetcher(`/responses/${id}/status`, {method: 'PATCH', body: JSON.stringify({status})}),
};
