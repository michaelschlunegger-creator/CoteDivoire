# CoteDivoire

Official source repository for the AAPG/EAGE **West African Transform Margin: Proven Successes and Emerging Frontiers** symposium website.

**Event:** 19–21 April 2027

**Location:** Abidjan, Côte d’Ivoire

**Live Site:** https://west-african-transform-2027.michael-schlunegger.chatgpt.site

## Source of truth

- `main` contains the approved source and documentation.
- All implementation work uses focused `agent/*` branches and pull requests.
- Requirements and current decisions are maintained in [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md).
- Repository working rules are defined in [AGENTS.md](AGENTS.md).
- The ChatGPT Site project ID is stored in `.openai/hosting.json` so future Site versions remain connected to the existing production Site.

## Technology

- Next.js 16 and React 19
- Vinext/Vite build targeting ChatGPT Sites and Cloudflare Workers
- Drizzle ORM with a Sites D1 database binding
- Supabase email one-time-password authentication

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout` for the bounded Sites lifecycle scripts

## Validation commands

- `npm ci` — install locked dependencies
- `npm test` — run the verified production build and rendered-HTML test
- `npm run lint` — run ESLint
- `npm run validate:artifact` — validate an existing Sites artifact

## Local development

1. Install dependencies with `npm ci`.
2. Configure required runtime variables locally without committing `.env` files.
3. Run `npm run dev`.

The production Site stores runtime configuration through ChatGPT Sites. Never commit Supabase service-role keys, passwords, access tokens, or other secrets.

## Current priority

Diagnose and fix the Supabase six-digit verification-code delivery and resend flow, then validate attendee and administrator sign-in end to end.
