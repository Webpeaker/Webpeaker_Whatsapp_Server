import { supabaseAdmin } from './supabaseAdmin.js';

export async function hasProcessedMessage(messageId: string) {
  const { data, error } = await supabaseAdmin
    .from('message_logs')
    .select('id')
    .eq('message_id', messageId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function logProcessedMessage(input: {
  message_id: string;
  phone: string;
  payload: unknown;
}) {
  const { error } = await supabaseAdmin.from('message_logs').insert(input);
  if (error && error.code !== '23505') throw error;
}
