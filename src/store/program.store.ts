import { create } from 'zustand';
import { supabase } from '@/infra/api/supabase.client';

export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  start_date?: string;
  is_active: boolean;
  created_at: string;
}

interface ProgramState {
  programs: TrainingProgram[];
  activeProgram: TrainingProgram | null;
  fetchPrograms: () => Promise<void>;
  createProgram: (name: string, total_weeks: number, start_date?: string) => Promise<string | null>;
  activateProgram: (programId: string) => Promise<void>;
  assignMenuToWeek: (programId: string, menuId: string, week: number) => Promise<void>;
  fetchProgramMenus: (programId: string) => Promise<any[]>;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  programs: [],
  activeProgram: null,

  fetchPrograms: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const active = data.find((p) => p.is_active) || null;
      set({ programs: data, activeProgram: active });
    }
  },

  createProgram: async (name, total_weeks, start_date) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return null;

    // Check feature gate: free tier limitation (mocking for MVP: allow creation)
    
    const { data, error } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        name,
        total_weeks,
        start_date: start_date || null,
        is_active: false // default to false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating program:', error);
      return null;
    }

    await get().fetchPrograms();
    return data.id;
  },

  activateProgram: async (programId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return;

    // Turn off all other programs
    await supabase
      .from('training_programs')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Turn on target program
    await supabase
      .from('training_programs')
      .update({ is_active: true })
      .eq('id', programId);

    await get().fetchPrograms();
  },

  assignMenuToWeek: async (programId, menuId, week) => {
    const { error } = await supabase
      .from('training_menus')
      .update({ program_id: programId, program_week: week })
      .eq('id', menuId);
    
    if (error) {
      console.error('Error assigning menu to week:', error);
    }
  },

  fetchProgramMenus: async (programId) => {
    const { data, error } = await supabase
      .from('training_menus')
      .select('id, name, program_week')
      .eq('program_id', programId)
      .not('program_week', 'is', null)
      .order('program_week', { ascending: true });

    if (error) {
      console.error('Error fetching program menus:', error);
      return [];
    }
    return data || [];
  }
}));
