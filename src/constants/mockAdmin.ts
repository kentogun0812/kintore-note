import { Session, User } from '@supabase/supabase-js';

export const isMockAdminMode = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN === 'true';

export const mockAdminUser: User = {
  id: 'mock-admin-id',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { name: 'Mock Admin', role: 'admin', isPremium: true },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  phone: '',
  email: 'admin@mock.local',
};

export const mockAdminSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockAdminUser,
};
