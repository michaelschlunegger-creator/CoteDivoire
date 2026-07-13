# CoteDivoire Repository Working Agreement

This repository is the single source of truth for the AAPG/EAGE West African Transform Margin Symposium website.

## Repository workflow

- Never make feature or fix changes directly on `main`.
- Create a focused branch using `agent/<short-description>`.
- Keep each pull request (PR) limited to one clear change or closely related change set.
- Run the relevant build, lint, type-check, and tests before requesting merge.
- Record the validation performed in the PR description.
- Use squash merge into `main` after review and validation.
- Delete merged feature branches when practical.
- Create regular preservation PRs at meaningful milestones; do not create empty or cosmetic PRs merely for activity.

## Source-of-truth rules

- The code and documentation merged into `main` are authoritative.
- Chat instructions that materially change scope, design, authentication, content, or deployment must be reflected in the repository in the same change set.
- Keep `docs/PROJECT_CONTEXT.md` updated when product requirements or operational decisions change.
- Avoid duplicate content across website pages. Each item should have one clear owning page or menu section.

## Security and configuration

- Never commit passwords, private keys, service-role keys, access tokens, one-time codes, or production secrets.
- Browser code may use only Supabase public project values intended for clients.
- Store local secrets in ignored environment files and production secrets in the deployment platform.
- Maintain `.env.example` with variable names only and safe placeholders.
- Authentication changes must be tested for initial code delivery, code entry, verification, resend behavior, expiry, errors, and rate limits.

## Website quality

- Preserve the approved AAPG/EAGE visual identity unless a task explicitly changes it.
- Keep AAPG and EAGE logos visually balanced and free from duplicated subtitle text.
- Check desktop, tablet, and mobile layouts.
- Use accessible labels, keyboard-friendly controls, readable contrast, and meaningful error messages.
- Do not publish placeholder event facts as confirmed information.

## Definition of done

A change is complete only when:

1. The intended files are committed on a focused branch.
2. Relevant checks pass, or limitations are stated clearly.
3. The PR explains the change, reason, impact, and validation.
4. The approved PR is merged into `main`.
5. The live deployment is checked when the change affects production.
