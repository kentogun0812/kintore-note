import { synchronize } from '@nozbe/watermelondb/sync';
import { getDatabase } from '@/db';
import { supabase } from '../api/supabase.client';

export async function syncWatermelonDB(userId: string) {
  if (!userId) {
    console.warn('Sync skipped: No user ID provided');
    return;
  }
  
  const database = getDatabase(userId);
  if (!database) {
    console.warn('Sync skipped: Database is not initialized (Running in Expo Go?)');
    return;
  }
  await synchronize({
    database,
    
    // Pull Changes from Supabase -> Local WatermelonDB
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      // Create a timestamp to query records updated since last sync.
      // Supabase expects a standard ISO strong or similar, lastPulledAt is a Unix timestamp in ms
      const lastPulledISO = lastPulledAt 
        ? new Date(lastPulledAt).toISOString() 
        : new Date(0).toISOString();

      // Example of pulling just 'training_menus' for MVP. 
      // In a real app, you'd pull all relevant tables (menus, sessions, sets, hanko)
      // and construct the changes object format expected by WatermelonDB.
      
      const { data: remoteMenus, error } = await supabase
        .from('training_menus')
        .select('*')
        .gt('updated_at', lastPulledISO);

      if (error) {
        console.error('Failed to pull changes from Supabase', error);
        throw new Error(error.message);
      }

      // Format changes for WatermelonDB consumption
      const changes = {
        training_menus: {
          created: [], // Records brand new on server
          updated: remoteMenus.map((menu: any) => ({
            id: menu.id,
            name: menu.name,
            is_template: menu.is_template,
            user_id: menu.user_id,
            created_at: new Date(menu.created_at).getTime(),
            updated_at: new Date(menu.updated_at).getTime(),
          })), 
          deleted: [], // IDs of records deleted on server
        },
        // add other tables here (menu_exercises, training_sessions, etc.)
      };

      // Ensure timestamp format returned matches what is expected
      return { changes, timestamp: Date.now() };
    },
    
    // Push Changes from Local WatermelonDB -> Supabase
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('Pushing changes to Supabase:', changes);

      // Extract changes for a table (e.g., training_menus)
      const { created, updated, deleted } = changes.training_menus || { created: [], updated: [], deleted: [] };

      // 1. Handle Creational
      if (created.length > 0) {
        // Map fields back to PG columns
        const newRecords = created.map(record => ({
          id: record.id,
          name: record.name,
          is_template: record.is_template,
          user_id: record.user_id,
          // DB defaults to current time on PG side, but you can pass local times if needed
        }));

        const { error } = await supabase.from('training_menus').insert(newRecords);
        if (error) throw new Error(`Push Create Error: ${error.message}`);
      }

      // 2. Handle Updates
      if (updated.length > 0) {
        for (const record of updated) {
          const { error } = await supabase
            .from('training_menus')
            .update({
              name: record.name,
              is_template: record.is_template,
              updated_at: new Date().toISOString()
            })
            .eq('id', record.id);
          
          if (error) throw new Error(`Push Update Error: ${error.message}`);
        }
      }

      // 3. Handle Deletions
      if (deleted.length > 0) {
        const { error } = await supabase
          .from('training_menus')
          .delete()
          .in('id', deleted);
        
        if (error) throw new Error(`Push Delete Error: ${error.message}`);
      }

      // Add push logic for other tables similarly
    },

    migrationsEnabledAtVersion: 1, // Change according to schema version
  });
}
