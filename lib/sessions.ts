import type { BotState } from '../types/whatsapp';
import { supabaseAdmin } from './supabaseAdmin';

export type WhatsappSession = {
  id: string;
  phone: string;
  name: string | null;
  current_state: BotState;
  selected_service: string | null;
  last_message: string | null;
  updated_at: string;
};

export async function getSession(phone: string) {
  const { data, error } = await supabaseAdmin
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();
  if (error) throw error;
  return data as WhatsappSession | null;
}

export async function upsertSession(input: {
  phone: string;
  name?: string;
  current_state: BotState;
  selected_service?: string | null;
  last_message?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('whatsapp_sessions')
    .upsert(
      {
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'phone' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as WhatsappSession;
}

export async function clearSession(phone: string) {
  const { error } = await supabaseAdmin
    .from('whatsapp_sessions')
    .update({
      current_state: 'COMPLETED',
      selected_service: null,
      last_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('phone', phone);
  if (error) throw error;
}
