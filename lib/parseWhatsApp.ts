import type { ParsedWhatsAppMessage } from '../types/whatsapp';

export function parseMessage(body: any): ParsedWhatsAppMessage {
  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const rawMessage = value?.messages?.[0];
    if (!rawMessage) return { isMessage: false };

    const contact = value?.contacts?.[0];
    const interactive = rawMessage.interactive;
    const listReply = interactive?.type === 'list_reply' ? interactive.list_reply : undefined;
    const buttonReply = interactive?.type === 'button_reply' ? interactive.button_reply : undefined;

    return {
      isMessage: true,
      message: {
        from: {
          phone: rawMessage.from,
          name: contact?.profile?.name || 'Customer',
        },
        timestamp: rawMessage.timestamp,
        text: rawMessage.text?.body ? { body: rawMessage.text.body } : undefined,
        type: rawMessage.type,
        message_id: rawMessage.id,
        list_reply: listReply ? { id: listReply.id, title: listReply.title } : undefined,
        button_reply: buttonReply ? { id: buttonReply.id, title: buttonReply.title } : undefined,
      },
    };
  } catch {
    return { isMessage: false };
  }
}
