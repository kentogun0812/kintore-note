import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 2000;

const ChunkedSecureStore = {
  getItem: async (key: string) => {
    const info = await SecureStore.getItemAsync(key);
    if (!info) return null;

    try {
      const parsed = JSON.parse(info);
      if (parsed && typeof parsed === 'object' && 'count' in parsed) {
        let value = '';
        for (let i = 0; i < parsed.count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) value += chunk;
        }
        return value;
      }
      return info;
    } catch (e) {
      return info;
    }
  },

  setItem: async (key: string, value: string) => {
    const chunks = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.substring(i, i + CHUNK_SIZE));
    }

    await SecureStore.setItemAsync(key, JSON.stringify({ count: chunks.length }));

    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
    }
  },

  removeItem: async (key: string) => {
    const info = await SecureStore.getItemAsync(key);
    if (info) {
      try {
        const parsed = JSON.parse(info);
        if (parsed && typeof parsed === 'object' && 'count' in parsed) {
          for (let i = 0; i < parsed.count; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
          }
        }
      } catch (e) {
        // Not chunked
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ChunkedSecureStore as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
