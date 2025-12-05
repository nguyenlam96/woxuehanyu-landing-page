# Supabase Universal Links Configuration

This document explains how to configure Supabase to use Universal Links for authentication flows.

## Overview

With Universal Links properly configured, users will experience seamless authentication:
- Email verification links open directly in your app
- Password reset links open directly in your app
- Web pages only display as fallback when app is not installed

## Supabase Configuration

### 1. Set Redirect URLs in Supabase Dashboard

Go to **Authentication > URL Configuration** in your Supabase dashboard and configure:

#### Site URL
```
https://auth.woxuehanyu.site
```

#### Redirect URLs (Add all of these)
```
https://auth.woxuehanyu.site/auth/callback
https://auth.woxuehanyu.site/auth/reset-password-in-app
com.woxuehanyu.dev://auth/callback
com.woxuehanyu.prod://auth/callback
```

### 2. Email Templates

Configure your email templates to use Universal Links:

#### Email Confirmation Template
```html
<h2>Confirm your email</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

**Set Confirmation URL to:**
```
https://auth.woxuehanyu.site/auth/callback
```

#### Password Reset Template
```html
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

**Set Confirmation URL to:**
```
https://auth.woxuehanyu.site/auth/reset-password-in-app
```

### 3. Flow Configuration

Enable PKCE flow for better security:

**Authentication > Settings:**
- ✅ Enable PKCE flow
- ✅ Enable email confirmations

## How It Works

### Email Verification Flow

1. User signs up in app
2. Supabase sends email with link: `https://auth.woxuehanyu.site/auth/callback?token=...&type=signup`
3. User clicks link:
   - **If app installed**: Universal Link opens app directly with token parameters
   - **If app not installed**: Web page shows "Please install WoXueHanyu app"
4. App extracts token from URL and completes verification via Supabase SDK

### Password Reset Flow

1. User requests password reset in app
2. Supabase sends email with link: `https://auth.woxuehanyu.site/auth/reset-password-in-app?code=...&type=recovery`
3. User clicks link:
   - **If app installed**: Universal Link opens app directly with recovery code
   - **If app not installed**: Web page shows "Please install WoXueHanyu app"
4. App extracts code and shows password reset screen
5. User enters new password, app calls Supabase SDK to update

### In-Browser Password Reset (Optional)

If you want users to reset password in browser instead of app, use:
```
https://auth.woxuehanyu.site/auth/reset-password
```

This page has a full password reset form with Supabase integration.

## Mobile App Integration

### iOS (Swift)

**1. Configure Associated Domains in Xcode:**
```
applinks:auth.woxuehanyu.site
```

**2. Handle Universal Links:**
```swift
func application(_ application: UIApplication,
                 continue userActivity: NSUserActivity,
                 restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }

    // Extract parameters from URL
    let components = URLComponents(url: url, resolvingAgainstBaseURL: true)
    let code = components?.queryItems?.first(where: { $0.name == "code" })?.value
    let type = components?.queryItems?.first(where: { $0.name == "type" })?.value

    if type == "recovery" {
        // Navigate to password reset screen with code
        showPasswordReset(code: code)
    } else {
        // Handle email verification
        verifyEmail(code: code)
    }

    return true
}
```

### Android (Kotlin)

**1. Configure App Links in AndroidManifest.xml:**
```xml
<activity android:name=".MainActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="auth.woxuehanyu.site"
            android:pathPrefix="/auth" />
    </intent-filter>
</activity>
```

**2. Handle App Links:**
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    handleIntent(intent)
}

override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    handleIntent(intent)
}

private fun handleIntent(intent: Intent?) {
    val data: Uri? = intent?.data
    if (data != null) {
        val code = data.getQueryParameter("code")
        val type = data.getQueryParameter("type")

        when (type) {
            "recovery" -> {
                // Navigate to password reset screen
                showPasswordReset(code)
            }
            else -> {
                // Handle email verification
                verifyEmail(code)
            }
        }
    }
}
```

## Testing

### Test Universal Links (iOS)
1. Send test email from Supabase
2. Open email on iOS device (not simulator)
3. Click link - app should open directly
4. Check URL parameters are passed to app

### Test App Links (Android)
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://auth.woxuehanyu.site/auth/callback?code=test123&type=signup" \
  com.woxuehanyu.dev
```

### Verify Configuration
- iOS: `https://auth.woxuehanyu.site/.well-known/apple-app-site-association`
- Android: `https://auth.woxuehanyu.site/.well-known/assetlinks.json`

Both should return valid JSON (no 404 errors).

## Troubleshooting

### Universal Links not working on iOS
- Clear Safari cache
- Uninstall and reinstall app
- Check Associated Domains capability is enabled
- Verify apple-app-site-association is accessible via HTTPS (no redirects)

### App Links not working on Android
- Run Digital Asset Links verification: `adb shell pm get-app-links com.woxuehanyu.dev`
- Check assetlinks.json has correct SHA-256 fingerprint
- Verify autoVerify="true" in intent-filter

### Web page shows instead of app opening
- Universal Links only work when clicked from outside your domain (email, SMS, etc.)
- They don't work when clicking from your own website or typing in browser
- This is expected behavior for security reasons
