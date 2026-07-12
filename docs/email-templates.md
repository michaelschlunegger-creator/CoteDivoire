# Event email templates

## Supabase authentication email

Configure the new Côte d’Ivoire event Supabase project under Authentication → Email Templates. The visible six-digit code must use Supabase’s official `{{ .Token }}` variable. Do not rely only on `{{ .ConfirmationURL }}`, because that sends a magic link rather than the website-entry OTP experience.

**Subject:** Your WAT Margin 2027 verification code

```html
<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#ffffff;color:#041521">
  <div style="background:#041521;padding:28px;border-bottom:4px solid #008b6c">
    <p style="margin:0;color:#e6ae3c;font-size:12px;letter-spacing:2px">AAPG · EAGE</p>
    <h1 style="margin:8px 0 0;color:#ffffff;font-size:25px">West African Transform Margin 2027</h1>
  </div>
  <div style="padding:30px;border:1px solid #d8e2e3">
    <p>Enter this six-digit code directly on the event website:</p>
    <div style="margin:26px 0;padding:18px;text-align:center;border-radius:14px;background:#edf5f3;color:#041521;font-size:36px;font-weight:800;letter-spacing:10px">{{ .Token }}</div>
    <p style="color:#5e6b75;font-size:13px">If you did not request this code, you can ignore this email.</p>
  </div>
</div>
```

## Transactional templates

The application contains event-branded transactional layouts for registration confirmation, reservation confirmation, reservation cancellation and important event announcements. Delivery is disabled safely until the event-specific provider key and verified sender address are configured as protected runtime values.

## Required configuration

- New Supabase project URL and publishable key
- New project Site URL and redirect URL
- Email OTP expiry and rate limits
- Event-specific SMTP host, port, username, password and sender
- Disable link tracking if the SMTP provider rewrites authentication links
- Optional transactional provider key for non-authentication emails

Never place SMTP passwords, provider keys, service-role keys or application passwords in public source or public environment variables.
