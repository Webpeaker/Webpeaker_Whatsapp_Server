import type { ParsedWhatsAppMessage, WhatsAppListPayload } from '../types/whatsapp';
import { createAppointment } from './appointments.js';
import { notifyAdmin } from './adminNotify.js';
import { createCareerApplication } from './career.js';
import { createLead } from './leads.js';
import { clearSession, getSession, upsertSession } from './sessions.js';
import { sendListMessage, sendMessageToPhoneNumber } from './whatsapp.js';

const services: Record<string, string> = {
  service_web_development: 'Web Development',
  service_cyber_security: 'Cyber Security',
  service_graphic_designing: 'Graphic Designing',
  service_digital_marketing: 'Digital Marketing',
};

const mainMenuIds = new Set(['menu_services', 'menu_career', 'menu_offers', 'menu_book_call', 'menu_contact']);

function normalize(text = '') {
  return text.trim().toLowerCase();
}

function isGreeting(text = '') {
  return ['hi', 'hello', 'start', 'menu', 'hey', 'hii'].includes(normalize(text));
}

function getNumberedField(text: string, fieldNumber: number) {
  const escaped = String(fieldNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|\\n)\\s*${escaped}[.)-]?\\s*(.*?)(?=\\n\\s*\\d+[.)-]?\\s|$)`, 'is');
  return text.match(pattern)?.[1]?.trim() || null;
}

function parseAppointmentDetails(text: string) {
  return {
    name: getNumberedField(text, 1),
    service: getNumberedField(text, 3),
    preferred_date: getNumberedField(text, 4),
    preferred_time: getNumberedField(text, 5),
    requirement: getNumberedField(text, 6) || text,
  };
}

function parseCareerName(text: string) {
  return getNumberedField(text, 1);
}

function mainMenuPayload(name: string): WhatsAppListPayload {
  return {
    header: 'Webpeaker Support',
    body: `👋 Welcome ${name} to Webpeaker Support\n\nWe help businesses with:\n🌐 Web Development\n🛡 Cyber Security\n🎨 Graphic Designing\n📈 Digital Marketing\n\nPlease choose an option below.`,
    footer: 'Reply Hi anytime to reopen this menu.',
    buttonText: 'Choose option',
    sections: [
      {
        title: 'Main Menu',
        rows: [
          { id: 'menu_services', title: 'Services', description: 'Explore Webpeaker services' },
          { id: 'menu_career', title: 'Career @ Webpeaker', description: 'Apply for jobs or internships' },
          { id: 'menu_offers', title: 'Offers', description: 'Current Webpeaker packages' },
          { id: 'menu_book_call', title: 'Book a Call', description: 'Request a consultation call' },
          { id: 'menu_contact', title: 'Contact Us', description: 'Website and support details' },
        ],
      },
    ],
  };
}

function servicesPayload(): WhatsAppListPayload {
  return {
    header: 'Webpeaker Services',
    body: 'Please choose the service you need.',
    buttonText: 'Choose service',
    sections: [
      {
        title: 'Services',
        rows: [
          { id: 'service_web_development', title: 'Web Development' },
          { id: 'service_cyber_security', title: 'Cyber Security' },
          { id: 'service_graphic_designing', title: 'Graphic Designing' },
          { id: 'service_digital_marketing', title: 'Digital Marketing' },
        ],
      },
    ],
  };
}

async function showMainMenu(phone: string, name: string) {
  await upsertSession({ phone, name, current_state: 'MAIN_MENU' });
  await sendListMessage(phone, mainMenuPayload(name));
}

async function handleMainMenuSelection(phone: string, name: string, id: string) {
  if (id === 'menu_services') {
    await upsertSession({ phone, name, current_state: 'SELECTING_SERVICE' });
    await sendListMessage(phone, servicesPayload());
    return;
  }

  if (id === 'menu_career') {
    await upsertSession({ phone, name, current_state: 'WAITING_CAREER_DETAILS' });
    await sendMessageToPhoneNumber(
      phone,
      `👨‍💻 Career @ Webpeaker\n\nPlease send your details:\n\n1. Name\n2. Skills\n3. Experience\n4. Internship / Job role\n5. Portfolio / Resume link\n\nOur HR team will review and contact you.`,
    );
    return;
  }

  if (id === 'menu_book_call') {
    await upsertSession({ phone, name, current_state: 'WAITING_CALL_DETAILS' });
    await sendMessageToPhoneNumber(
      phone,
      `📞 Book a Call with Webpeaker\n\nPlease send:\n\n1. Your name\n2. Business / project name\n3. Service required\n4. Preferred date\n5. Preferred time\n6. Short project details`,
    );
    return;
  }

  if (id === 'menu_offers') {
    await sendMessageToPhoneNumber(
      phone,
      `🎁 Current Webpeaker Offers\n\n🔥 Website Development Packages\n🔥 Cyber Security Audit\n🔥 Social Media Design Bundle\n🔥 Digital Marketing Starter Plan\n\nTo discuss an offer, select Book a Call.`,
    );
    await showMainMenu(phone, name);
    return;
  }

  if (id === 'menu_contact') {
    await sendMessageToPhoneNumber(
      phone,
      `📩 Contact Webpeaker\n\nWebsite: https://webpeaker.com\nSupport: support@webpeaker.com\nHR: hrmanager@webpeaker.com\n\nYou can also reply Hi anytime to open the menu.`,
    );
    await upsertSession({ phone, name, current_state: 'COMPLETED' });
  }
}

async function handleServiceSelection(phone: string, name: string, id: string) {
  const service = services[id];
  if (!service) {
    await sendListMessage(phone, servicesPayload());
    return;
  }

  await upsertSession({
    phone,
    name,
    current_state: 'WAITING_PROJECT_DETAILS',
    selected_service: service,
  });

  await sendMessageToPhoneNumber(
    phone,
    `Great! You selected ${service}.\n\nPlease explain your project requirement in detail.\n\nYou can include:\n- What do you need?\n- Budget\n- Deadline\n- Reference website/app/design\n- Any special features\n\nOur Webpeaker team will review your requirement and reply within 5 hours.`,
  );
}

export async function processIncomingWhatsAppMessage(parsed: ParsedWhatsAppMessage) {
  if (!parsed.isMessage || !parsed.message) return;

  const message = parsed.message;
  const phone = message.from.phone;
  const name = message.from.name || 'Customer';
  const text = message.text?.body || '';
  const replyId = message.list_reply?.id || message.button_reply?.id || '';
  const session = await getSession(phone);

  if (isGreeting(text)) {
    await showMainMenu(phone, name);
    return;
  }

  if (replyId && mainMenuIds.has(replyId)) {
    await handleMainMenuSelection(phone, name, replyId);
    return;
  }

  if (replyId && services[replyId]) {
    await handleServiceSelection(phone, name, replyId);
    return;
  }

  if (session?.current_state === 'WAITING_PROJECT_DETAILS') {
    const service = session.selected_service || 'General Inquiry';
    await createLead({
      phone,
      name,
      lead_type: 'Service Lead',
      service,
      message: text,
    });
    await clearSession(phone);
    await sendMessageToPhoneNumber(
      phone,
      `✅ Thank you ${name}!\n\nYour ${service} requirement has been received by Webpeaker Team.\n\nOur team will review your requirement and reply within 5 hours.\n\nFor urgent support: support@webpeaker.com`,
    );
    await notifyAdmin(
      `🚀 New Webpeaker Lead\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nType: Service Lead\n\nRequirement:\n${text}\n\nReply within 5 hours.`,
    );
    return;
  }

  if (session?.current_state === 'WAITING_CAREER_DETAILS') {
    await createCareerApplication({ phone, name: parseCareerName(text) || name, message: text });
    await clearSession(phone);
    await sendMessageToPhoneNumber(
      phone,
      `✅ Thank you for showing interest in Career @ Webpeaker.\n\nOur HR team will review your details and contact you soon.\n\nYou can also mail us at:\nhrmanager@webpeaker.com`,
    );
    await notifyAdmin(`👨‍💻 New Career Application\n\nName: ${name}\nPhone: ${phone}\n\nDetails:\n${text}`);
    return;
  }

  if (session?.current_state === 'WAITING_CALL_DETAILS') {
    const appointment = parseAppointmentDetails(text);
    await createAppointment({
      phone,
      name: appointment.name || name,
      service: appointment.service,
      preferred_date: appointment.preferred_date,
      preferred_time: appointment.preferred_time,
      requirement: appointment.requirement,
    });
    await clearSession(phone);
    await sendMessageToPhoneNumber(
      phone,
      `✅ Your call request has been submitted.\n\nWebpeaker Team will contact you soon.\nExpected response time: within 5 hours.`,
    );
    await notifyAdmin(`📞 New Call Booking Request\n\nName: ${name}\nPhone: ${phone}\n\nDetails:\n${text}`);
    return;
  }

  if (session?.current_state === 'SELECTING_SERVICE') {
    await sendListMessage(phone, servicesPayload());
    return;
  }

  await showMainMenu(phone, name);
}
