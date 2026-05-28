import { supabaseAdmin } from './supabaseAdmin.js';

export async function createAppointment(input: {
  phone: string;
  name?: string;
  service?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  requirement: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}
