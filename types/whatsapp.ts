export type BotState =
  | 'MAIN_MENU'
  | 'SELECTING_SERVICE'
  | 'WAITING_PROJECT_DETAILS'
  | 'WAITING_CALL_DETAILS'
  | 'WAITING_CAREER_DETAILS'
  | 'COMPLETED';

export type ParsedWhatsAppMessage = {
  isMessage: boolean;
  message?: {
    from: {
      phone: string;
      name: string;
    };
    timestamp: string;
    text?: { body: string };
    type: string;
    message_id: string;
    list_reply?: { id: string; title?: string };
    button_reply?: { id: string; title?: string };
  };
};

export type WhatsAppListRow = {
  id: string;
  title: string;
  description?: string;
};

export type WhatsAppListPayload = {
  header?: string;
  body: string;
  footer?: string;
  buttonText: string;
  sections: Array<{
    title: string;
    rows: WhatsAppListRow[];
  }>;
};
