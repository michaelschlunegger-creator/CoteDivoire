# Project Context

Last updated: 12 July 2026

## Event

- Organizers: American Association of Petroleum Geologists (AAPG) and European Association of Geoscientists and Engineers (EAGE)
- Event: West African Transform Margin: Proven Successes and Emerging Frontiers
- Dates: 19–21 April 2027
- Location: Abidjan, Côte d’Ivoire
- Geographic focus: Sierra Leone, Liberia, Côte d’Ivoire, Ghana, Togo, Benin, and Nigeria

## Purpose

The website supports the full event journey:

1. Introduce the symposium and build interest.
2. Present approved event, technical-program, venue, sponsor, speaker, and attendee information.
3. Let visitors register using email verification with a six-digit one-time password (OTP).
4. Collect the event-registration information.
5. Move verified registrants into their personal participant hub.
6. Support event communications, administration, and post-event feedback.

## Current design direction

- Keep the approved AAPG/EAGE event theme.
- Use the approved “Save the Date / Mark Your Calendar” visual as the leading landing-page visual.
- Show the principal AAPG and EAGE logos at matching visual height and size.
- Do not display the small explanatory text beneath the EAGE logo.
- Use the approved navigation structure and place each content item in one section only.
- Avoid duplicated information across menu pages.

## Authentication requirement

The required customer journey is:

1. Select **Register for Event**.
2. Enter an email address.
3. Receive a six-digit verification code.
4. Enter the code directly on the website.
5. Complete event registration.
6. Enter the personal participant hub automatically.

The website uses Supabase project `wat-margin-2027-auth`.

### Authentication acceptance criteria

- A valid email receives the six-digit code.
- The website presents six editable code inputs or one accessible six-digit input.
- Paste, keyboard entry, correction, and submission work.
- Resend generates a new usable code after the configured cooldown.
- The interface explains cooldowns, expiry, invalid codes, and rate limits.
- Successful verification creates a valid session and continues the registration flow.
- Admin and participant roles are enforced server-side, not only hidden in the interface.
- Authentication events can be traced through Supabase Auth Logs without exposing secrets.

## Known unresolved issue

As of 12 July 2026, Supabase email OTP authentication is not reliable:

- At least one code was received previously.
- Resend did not reliably deliver a new code.
- A test sent to another address did not deliver a code.
- The audit-log database setting is enabled, but actual Auth Logs and application behavior still require diagnosis.
- The live website source code has not yet been imported into this GitHub repository.

## Immediate priorities

1. Import the complete current website source into this repository.
2. Add safe environment-variable documentation without committing secrets.
3. Reproduce the OTP and resend failures.
4. Inspect Supabase Auth Logs, application requests, email template, redirect configuration, rate limits, and delivery settings.
5. Fix and test the complete registration-to-participant-hub flow.
6. Continue the approved information-architecture and branding changes through focused branches and PRs.

## Administration

- The website must include an understandable admin experience for non-technical event staff.
- Admin sign-in and authorization must be tested separately from attendee registration.
- Event operational email context includes `aapgevents@gmail.com`; its exact sending, receiving, and notification responsibilities must be documented before production launch.
- A customer survey of at least 15 relevant questions is required in the participant/customer portal.
