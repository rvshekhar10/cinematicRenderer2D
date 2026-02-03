# Enable Two-Factor Authentication for NPM Publishing

NPM requires 2FA (Two-Factor Authentication) to publish packages. Here's how to set it up.

## Quick Fix

### Option 1: Enable 2FA for Publishing Only (Recommended)

```bash
npm profile enable-2fa auth-and-writes
```

This will:
1. Prompt you to install an authenticator app (if you haven't already)
2. Show you a QR code to scan
3. Ask you to enter a verification code
4. Enable 2FA for publishing

### Option 2: Enable 2FA for Everything

```bash
npm profile enable-2fa auth-only
```

This requires 2FA for login AND publishing.

## Step-by-Step Setup

### 1. Install an Authenticator App

Choose one of these apps on your phone:
- **Google Authenticator** (iOS/Android)
- **Authy** (iOS/Android) - Recommended, has backup
- **Microsoft Authenticator** (iOS/Android)
- **1Password** (if you use it)

### 2. Enable 2FA on NPM

```bash
npm profile enable-2fa auth-and-writes
```

You'll see output like:
```
> npm notice Enabling two-factor authentication for auth-and-writes
> npm notice Scan this QR code into your authenticator app:
```

### 3. Scan the QR Code

1. Open your authenticator app
2. Tap "Add account" or "+"
3. Scan the QR code shown in your terminal
4. The app will show a 6-digit code

### 4. Enter the Verification Code

```
> npm notice Enter OTP:
```

Enter the 6-digit code from your authenticator app.

### 5. Save Your Recovery Codes

NPM will show you recovery codes. **SAVE THESE SOMEWHERE SAFE!**

```
> npm notice Recovery codes:
> npm notice   12345-67890
> npm notice   abcde-fghij
```

Store these in:
- Password manager
- Secure note
- Printed and stored safely

## Publishing After 2FA is Enabled

### Method 1: Interactive (Recommended)

```bash
npm publish
```

When prompted, enter the 6-digit code from your authenticator app:
```
> npm notice Enter OTP:
```

### Method 2: One-Time Password Flag

```bash
npm publish --otp=123456
```

Replace `123456` with the current code from your authenticator app.

**Note**: The code changes every 30 seconds, so use it quickly!

## Verify 2FA is Enabled

```bash
npm profile get
```

Look for:
```
tfa: auth-and-writes
```

## Troubleshooting

### "Invalid OTP"

**Cause**: Code expired or incorrect

**Solution**:
1. Wait for a new code to appear in your app
2. Enter it immediately
3. Make sure your phone's time is correct (OTP codes are time-based)

### "Lost Access to Authenticator"

**Solution**: Use your recovery codes

```bash
npm profile enable-2fa auth-and-writes --otp=12345-67890
```

Replace with one of your recovery codes.

### "Can't Scan QR Code"

**Solution**: Enter the code manually

The terminal will also show a text code like:
```
otpauth://totp/npm:username?secret=ABCD1234...
```

In your authenticator app:
1. Choose "Enter code manually"
2. Enter the secret key (the part after `secret=`)

### "Need to Disable 2FA"

**Not recommended**, but if needed:

```bash
npm profile disable-2fa
```

You'll need to enter an OTP code to disable it.

## Alternative: Use Access Tokens

If you don't want to enter OTP every time, create an automation token:

### 1. Create Token

```bash
npm token create --read-only=false
```

Or via web:
1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token"
3. Choose "Automation" type
4. Copy the token

### 2. Use Token for Publishing

```bash
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
npm publish
```

**Warning**: Keep tokens secure! Don't commit them to git.

## Quick Reference

```bash
# Enable 2FA
npm profile enable-2fa auth-and-writes

# Check 2FA status
npm profile get

# Publish with OTP
npm publish --otp=123456

# Disable 2FA (not recommended)
npm profile disable-2fa
```

## After Setup

Once 2FA is enabled, try publishing again:

```bash
npm publish
```

When prompted for OTP, enter the 6-digit code from your authenticator app.

## Security Best Practices

1. ✅ Use `auth-and-writes` mode (not `auth-only`)
2. ✅ Save recovery codes in a secure location
3. ✅ Use Authy or similar app with backup
4. ✅ Keep your phone secure
5. ✅ Don't share OTP codes
6. ✅ Use automation tokens for CI/CD

## Need Help?

- NPM 2FA Docs: https://docs.npmjs.com/configuring-two-factor-authentication
- NPM Support: https://www.npmjs.com/support

---

**Ready?** Run `npm profile enable-2fa auth-and-writes` to get started!
