// ===== SUPABASE INITIALIZATION =====
// Centralized Supabase client for all modular scripts

const SUPABASE_URL = "https://huqvvgmjookafyoonydd.supabase.co";
const SUPABASE_KEY = "sb_publishable_kE25D9JRf_pbrPyi5eUX8Q_yKTiiGn7";

// Initialize the client globally as _supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase client initialized successfully.");
