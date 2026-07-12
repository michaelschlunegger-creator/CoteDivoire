# CoteDivoire

Official source repository for the AAPG/EAGE **West African Transform Margin: Proven Successes and Emerging Frontiers** symposium website.

**Event:** 19–21 April 2027  
**Location:** Abidjan, Côte d’Ivoire

## Repository status

The repository governance and project context have been established. The complete current website source still needs to be imported before application debugging and deployment can be managed through GitHub.

## Working method

- `main` is the approved single source of truth.
- All changes use focused `agent/*` branches.
- Changes are reviewed through pull requests and validated before squash merge.
- Requirements and decisions are maintained in [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md).
- Repository working rules are defined in [AGENTS.md](AGENTS.md).

## Current priority

Import the existing website source, then diagnose and fix the Supabase six-digit email verification and resend flow.
