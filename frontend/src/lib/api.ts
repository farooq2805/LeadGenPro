const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string; company?: string }) =>
      request<{ token: string; user: any }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
  },
  leads: {
    generate: (data: { prompt: string; industry?: string; location?: string; title?: string; companySize?: string; count?: number }) =>
      request<any>('/leads/generate', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<any[]>('/leads'),
    get: (id: string) => request<any>(`/leads/${id}`),
    downloadUrl: (id: string) => {
      const token = getToken();
      return `${API_BASE}/leads/${id}/download?token=${token}`;
    },
  },
  credits: {
    get: () => request<{ freeRemaining: number; freeUsed: number; totalFreeLeads: number; purchasedRemaining: number; totalAvailable: number }>('/credits'),
  },
  orders: {
    create: (quantity: number) =>
      request<{ orderId: string; quantity: number; total: number; currency: string; pricePerLead: number }>('/orders/create', { method: 'POST', body: JSON.stringify({ quantity }) }),
    confirm: (orderId: string, paymentId?: string) =>
      request<{ success: boolean; creditsAdded: number }>('/orders/confirm', { method: 'POST', body: JSON.stringify({ orderId, paymentId }) }),
    list: () => request<any[]>('/orders'),
  },
};
