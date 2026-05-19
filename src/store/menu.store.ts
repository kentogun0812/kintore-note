import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/infra/api/supabase.client';

export interface MenuExercise {
  id: string; // The exercise DB id
  name: string;
}

export interface SavedMenu {
  id: string;
  name: string;
  exercises: MenuExercise[];
  createdAt: string;
}

interface MenuBuilderState {
  menuName: string;
  exercises: MenuExercise[];
  savedMenus: SavedMenu[];
  setMenuName: (name: string) => void;
  addExerciseToMenu: (exercise: MenuExercise) => void;
  removeExerciseFromMenu: (exerciseId: string) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  clearMenuBuilder: () => void;
  saveCurrentMenu: () => Promise<void>;
  fetchSavedMenus: () => Promise<void>;
}

export const useMenuStore = create<MenuBuilderState>()(
  persist(
    (set, get) => ({
      menuName: '',
      exercises: [],
      savedMenus: [],
      
      setMenuName: (name) => set({ menuName: name }),
      
      addExerciseToMenu: (exercise) => set((state) => {
        if (state.exercises.find(e => e.id === exercise.id)) return state;
        return { exercises: [...state.exercises, exercise] };
      }),
      
      removeExerciseFromMenu: (exerciseId) => set((state) => ({
        exercises: state.exercises.filter(e => e.id !== exerciseId)
      })),

      reorderExercises: (fromIndex, toIndex) => set((state) => {
        const newExercises = [...state.exercises];
        const [moved] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, moved);
        return { exercises: newExercises };
      }),

      clearMenuBuilder: () => set({
        menuName: '',
        exercises: []
      }),

      fetchSavedMenus: async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from('training_menus')
          .select(`
            id, name, created_at,
            menu_exercises (
              sort_order,
              exercises ( id, name_ja, name_en )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const parsed = data.map((m: any) => ({
            id: m.id,
            name: m.name,
            createdAt: m.created_at,
            exercises: 
              m.menu_exercises
                ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((me: any) => ({
                   id: me.exercises.id,
                   name: me.exercises.name_ja
                })) || []
          }));
          set({ savedMenus: parsed });
        }
      },

      saveCurrentMenu: async () => {
        const { menuName, exercises, savedMenus } = get();
        if (!menuName || exercises.length === 0) return;

        let isSuccess = false;
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData.session?.user.id;
          
          if (userId) {
            const { data: menuData, error: menuErr } = await supabase
              .from('training_menus')
              .insert({ name: menuName, user_id: userId, is_template: false })
              .select('id')
              .single();
              
            if (menuErr) {
              console.log('[MenuStore] DB Error:', menuErr);
              return { success: false, error: 'DB_ERROR' };
            }

            const mappedExercises = exercises.map((ex, index) => ({
              menu_id: menuData.id,
              exercise_id: ex.id,
              sort_order: index,
              target_sets: 3,
              target_reps: 10
            }));

            await supabase.from('menu_exercises').insert(mappedExercises);
            get().fetchSavedMenus();
          } else {
            if (savedMenus.length >= 1) {
              return { success: false, error: 'GUEST_LIMIT_REACHED' };
            }

            const newMenu: SavedMenu = {
              id: Math.random().toString(),
              name: menuName,
              exercises: [...exercises],
              createdAt: new Date().toISOString(),
            };

            set((state) => ({
              savedMenus: [newMenu, ...state.savedMenus]
            }));
          }
          isSuccess = true;
        } catch(err: any) {
          console.log('[MenuStore] Failed to save menu:', err);
          return { success: false, error: err.message };
        } finally {
          // Clear only if success
          if (isSuccess) {
             set({ menuName: '', exercises: [] });
          }
          return { success: isSuccess };
        }
      }
    }),
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
