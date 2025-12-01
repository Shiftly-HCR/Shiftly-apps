import { createClient } from "@supabase/supabase-js";

// Pour Next.js, utilisez NEXT_PUBLIC_ pour les variables accessibles côté client
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_API_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase configuration manquante. Veuillez configurer les variables d'environnement :\n" +
      "- NEXT_PUBLIC_SUPABASE_URL\n" +
      "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
