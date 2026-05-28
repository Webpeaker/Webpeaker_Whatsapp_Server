# Webpeaker LeadBot CRM

Production-ready WhatsApp lead generation, appointment booking, and CRM dashboard for Webpeaker.

## Stack

- React, Vite, Tailwind CSS, React Router
- Supabase Auth and PostgreSQL
- Vercel Serverless API routes
- Meta WhatsApp Cloud API
- Node.js and TypeScript backend modules

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Create a Supabase project, then open Supabase SQL Editor and run:

```sql
-- database/schema.sql
```

Use the contents of `database/schema.sql`. This creates tables for sessions, leads, appointments, career applications, admin notes, and message logs. It also enables RLS policies for authenticated dashboard access.

4. Create an admin user:

- Supabase dashboard -> Authentication -> Users -> Add user
- Set an email and password
- Use that email/password on `/login`

5. Configure Meta WhatsApp Cloud API:

- Create or open a Meta app
- Add WhatsApp product
- Copy the permanent or temporary access token into `META_WA_ACCESS_TOKEN`
- Copy Phone Number ID into `META_WA_PHONE_NUMBER_ID`
- Add your admin WhatsApp number to `ADMIN_PHONE_NUMBER` in international format without `+`

6. Configure webhook:

- Local development requires a public tunnel such as ngrok or Cloudflare Tunnel
- Webhook callback URL: `https://your-domain.com/api/whatsapp`
- Verify token: same value as `META_WA_VERIFY_TOKEN`
- Subscribe to `messages`

7. Run locally:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Deploy on Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add all variables from `.env.example` in Vercel Project Settings.
4. Deploy.
5. Set `PROD_URL` and `VITE_PROD_URL` to the deployed Vercel URL.
6. Configure Meta webhook callback URL as:

```text
https://your-vercel-app.vercel.app/api/whatsapp
```

## WhatsApp Bot Test

Send `Hi`, `Hello`, `Start`, or `Menu` to your WhatsApp Cloud API number.

Expected flow:

- Main list menu opens
- Services asks for project details and saves a lead
- Career asks for candidate details and saves an application
- Book a Call asks for call details and saves an appointment
- Offers displays current packages and returns to the menu
- Contact Us sends Webpeaker website and support emails

Admin notifications are sent to `ADMIN_PHONE_NUMBER`.

## Environment Safety

Only `VITE_` variables are exposed to the browser. Keep these server-only values out of frontend code:

- `SUPABASE_SERVICE_ROLE_KEY`
- `META_WA_ACCESS_TOKEN`
- `META_WA_VERIFY_TOKEN`

## Project Structure

```text
api/whatsapp/index.ts       Webhook verification and message receiver
api/whatsapp/message.ts     Manual send-message API helper
lib/                        Backend WhatsApp, Supabase, session, and bot helpers
types/                      Shared backend TypeScript types
database/schema.sql         Supabase schema and RLS policies
src/components/             Reusable dashboard components
src/pages/                  Login, dashboard, leads, appointments, career, settings
src/lib/supabase.js         Frontend Supabase client
```

## Notes

- Duplicate WhatsApp message IDs are stored in `message_logs`.
- Unsupported WhatsApp webhook events return `200` safely.
- Service role access is used only in serverless backend code.
