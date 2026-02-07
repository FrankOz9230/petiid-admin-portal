/**
 * PETIID ADMIN - SUPABASE CLIENT
 * Database connection and configuration
 */

const SUPABASE_URL = 'https://huqvvgmjookafyoonydd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kE25D9JRf_pbrPyi5eUX8Q_yKTiiGn7';


// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Database helper functions
 */
const db = {
    // Get current user
    async getCurrentUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    },

    // Get profile by user ID
    async getProfile(userId) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    // Generic query helper
    async query(table, options = {}) {
        let query = supabaseClient.from(table).select(options.select || '*');

        if (options.filters) {
            for (const [key, value] of Object.entries(options.filters)) {
                query = query.eq(key, value);
            }
        }

        if (options.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.range) {
            query = query.range(options.range.from, options.range.to);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    // Count records
    async count(table, filters = {}) {
        let query = supabaseClient.from(table).select('*', { count: 'exact', head: true });

        for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
        }

        const { count, error } = await query;
        if (error) throw error;
        return count;
    },

    // Insert record
    async insert(table, data) {
        const { data: result, error } = await supabaseClient
            .from(table)
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    // Update record
    async update(table, id, data) {
        const { data: result, error } = await supabaseClient
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return result;
    },

    // Delete record
    async delete(table, id) {
        const { error } = await supabaseClient
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// Export for use in other modules
window.supabase = supabaseClient;
window.supabaseClient = supabaseClient;
window.db = db;

console.log('✅ Supabase client initialized');
