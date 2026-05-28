import axios from 'axios';
import type { WhatsAppListPayload } from '../types/whatsapp';
import { requireEnv } from './env.js';
export { parseMessage } from './parseWhatsApp.js';

const graphVersion = 'v20.0';

function whatsappUrl() {
  return `https://graph.facebook.com/${graphVersion}/${requireEnv('META_WA_PHONE_NUMBER_ID')}/messages`;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${requireEnv('META_WA_ACCESS_TOKEN')}`,
    'Content-Type': 'application/json',
  };
}

export async function sendMessageToPhoneNumber(phone: string, message: string) {
  return axios.post(
    whatsappUrl(),
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'text',
      text: { preview_url: false, body: message },
    },
    { headers: authHeaders() },
  );
}

export async function sendListMessage(phone: string, payload: WhatsAppListPayload) {
  return axios.post(
    whatsappUrl(),
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: payload.header ? { type: 'text', text: payload.header } : undefined,
        body: { text: payload.body },
        footer: payload.footer ? { text: payload.footer } : undefined,
        action: {
          button: payload.buttonText,
          sections: payload.sections,
        },
      },
    },
    { headers: authHeaders() },
  );
}

export async function sendSimpleButtonsMessage(
  phone: string,
  text: string,
  buttons: Array<{ id: string; title: string }>,
) {
  return axios.post(
    whatsappUrl(),
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.slice(0, 3).map((button) => ({
            type: 'reply',
            reply: button,
          })),
        },
      },
    },
    { headers: authHeaders() },
  );
}

export async function markMessageAsRead(messageId: string) {
  return axios.post(
    whatsappUrl(),
    {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    },
    { headers: authHeaders() },
  );
}
