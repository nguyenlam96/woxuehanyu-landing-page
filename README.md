# WoXueHanyu Auth

Authentication pages for WoXueHanyu mobile app using Universal Links.

## Overview

This project provides web-based authentication endpoints that integrate with Supabase and redirect to the WoXueHanyu mobile app via Universal Links (iOS) and App Links (Android).

## Features

- **Universal Links**: Seamless app opening from email links
- **Email Verification**: Handles Supabase email confirmation callbacks
- **Password Reset**: In-browser and in-app password reset flows
- **Fallback Pages**: User-friendly pages when app is not installed

## Quick Start

### Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Connect to Cloudflare Pages
3. Build command: `npx wrangler deploy`
4. Configure custom domain: `auth.woxuehanyu.site`

### Configure Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed configuration instructions.

## Project Structure

```
woxuehanyu-auth/
├── .well-known/                    # Universal/App Links configuration
│   ├── apple-app-site-association  # iOS Universal Links
│   └── assetlinks.json            # Android App Links
├── auth/
│   ├── verify-email/              # Email confirmation (sign up verification only)
│   ├── reset-password/            # In-browser password reset (alternative flow)
│   └── reset-password-in-app/     # In-app password reset (primary flow)
├── wrangler.jsonc                 # Cloudflare Pages config
└── SUPABASE_SETUP.md             # Supabase configuration guide
```

## Page Purposes

- **`/auth/verify-email`** - Email confirmation after sign up (Universal Link fallback)
- **`/auth/reset-password-in-app`** - Password reset redirect to app (Universal Link fallback)
- **`/auth/reset-password`** - Full in-browser password reset form (alternative to in-app)

## How It Works

1. **User clicks email link** from Supabase (e.g., email verification, password reset)
2. **Universal Link intercepts** the request and opens the app directly
3. **App extracts parameters** from the URL (code, token, type)
4. **App completes flow** via Supabase SDK
5. **Web page as fallback** only shows if app is not installed

## Testing

```bash
# Test Universal Links (iOS)
# Open Safari and visit:
https://auth.woxuehanyu.site/auth/verify-email?code=test&type=signup

# Test App Links (Android)
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://auth.woxuehanyu.site/auth/verify-email?code=test&type=signup" \
  com.woxuehanyu.dev
```

## License

MIT
