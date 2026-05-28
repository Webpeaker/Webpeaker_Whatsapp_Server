import { supabaseAdmin } from './supabaseAdmin';

export async function createCareerApplication(input: {
  phone: string;
  name?: string;
  message: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('career_applications')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}
