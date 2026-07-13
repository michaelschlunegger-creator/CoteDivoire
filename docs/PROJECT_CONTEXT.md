# CoteDivoire website context

## Landing page

- The landing page keeps a compact structure: save-the-date artwork and registration bar, seven-country regional focus band, countdown, call-for-abstracts announcement, and footer.
- The regional focus band covers Sierra Leone, Liberia, Côte d’Ivoire, Ghana, Togo, Benin, and Nigeria. It supports automatic rotation, manual controls, horizontal touch scrolling, and keyboard navigation without asserting unconfirmed programme facts.
- The header displays the event dates and Abidjan location in compact supporting text. The AAPG and EAGE marks should remain visually balanced at desktop and mobile sizes.
- The call-for-abstracts announcement states only “Call for Abstracts Opening Soon” until confirmed submission information is available.
- Do not restore the removed “Everything in one place,” technical-programme, or register-and-travel middle marketing sections on the landing page unless explicitly approved.

## Protected systems

- Visual landing-page work must not modify authentication, registration, email verification, participant hub, admin access, Supabase or Sites storage bindings, database schemas or policies, environment variables, or `vercel.json`.
- The official Vercel address remains a reverse proxy to the existing ChatGPT Sites project defined in `.openai/hosting.json`.
