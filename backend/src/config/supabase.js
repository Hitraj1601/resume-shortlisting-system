import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration incomplete. Some features may not work.');
}

// Public client for client-side operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supabase functions
const supabaseFunctions = {
  // User management
  async createUser(userData) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
          company: userData.company,
        },
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Supabase create user error:', error);
      return { success: false, error: error.message };
    }
  },

  // File storage
  async uploadFile(bucket, path, file, options = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return { success: true, data, publicUrl: urlData.publicUrl };
    } catch (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }
  },

  // Database operations
  async insert(table, data) {
    try {
      const { data: result, error } = await supabaseAdmin
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }
  },

  async select(table, query = {}) {
    try {
      let queryBuilder = supabaseAdmin.from(table).select();
      
      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      // Apply pagination
      if (query.page && query.limit) {
        const from = (query.page - 1) * query.limit;
        const to = from + query.limit - 1;
        queryBuilder = queryBuilder.range(from, to);
      }
      
      // Apply sorting
      if (query.sortBy && query.sortOrder) {
        queryBuilder = queryBuilder.order(query.sortBy, { ascending: query.sortOrder === 'asc' });
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Supabase select error:', error);
      return { success: false, error: error.message };
    }
  },

  async update(table, data, filters) {
    try {
      let queryBuilder = supabaseAdmin.from(table).update(data);
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      const { data: result, error } = await queryBuilder.select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Supabase update error:', error);
      return { success: false, error: error.message };
    }
  },

  async delete(table, filters) {
    try {
      let queryBuilder = supabaseAdmin.from(table).delete();
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      const { data, error } = await queryBuilder.select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }
  },

  // Real-time subscriptions
  subscribe(table, event, callback) {
    return supabase
      .channel(table)
      .on('postgres_changes', { event, schema: 'public', table }, callback)
      .subscribe();
  },
};

export { supabase, supabaseAdmin, supabaseFunctions };
