import { supabaseAdmin } from './supabaseAdmin.js';

export async function createLead(input: {
  phone: string;
  name?: string;
  lead_type: string;
  service?: string | null;
  message: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}
