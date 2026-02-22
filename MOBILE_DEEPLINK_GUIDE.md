# Mobile Deep Linking Guide

## Overview

Your wallet connection feature now supports **deep linking** on mobile devices. This means users can:
- Click "Connect Wallet" on mobile
- Get redirected directly to their wallet app (Phantom or MetaMask)
- Complete the connection within the app
- Remain in the wallet app's in-app browser

## How It Works

### Mobile Flow

1. **User clicks wallet button** → Modal opens
2. **Mobile detection** → App detects device is mobile
3. **Primary attempt** → Tries WalletConnect protocol
4. **Fallback** → If WalletConnect fails, initiates deep link
5. **App redirect** → User opens wallet app via deep link
6. **In-app browser** → Transaction/signature happens in app's browser
7. **User stays in app** → No forced return to original site

### Desktop Flow

1. **User clicks wallet button** → Modal opens
2. **Extension detection** → App detects installed extension
3. **Direct connection** → Uses MetaMask or Phantom extension APIs
4. **No redirect needed** → Connection happens in background

## Deep Link URLs

### Phantom
```
https://phantom.app/ul/browse/{CURRENT_URL}
```

**Example:**
```
https://phantom.app/ul/browse/https%3A%2F%2Finteliose.vercel.app%2Fdashboard
```

### MetaMask
```
metamask://dapp/{HOSTNAME}{PATHNAME}
```

**Example:**
```
metamask://dapp/inteliose.vercel.app/dashboard
```

## Testing Deep Linking

### On iPhone (Safari)
1. Install Phantom or MetaMask app
2. Open your website in Safari
3. Click "Connect Wallet"
4. Select Phantom or MetaMask
5. Should redirect to app → Accept connection → App browser shows your site

### On Android (Chrome)
1. Install Phantom or MetaMask app
2. Open your website in Chrome
3. Click "Connect Wallet"
4. Select Phantom or MetaMask
5. Should redirect to app → Accept connection → App browser shows your site

## Key Features

### ✅ Automatic Detection
- Detects if user is on mobile or desktop
- Detects if wallet app is installed
- Detects if wallet extension is installed

### ✅ Fallback Chain
1. **Mobile**: WalletConnect → Deep Link → Install Prompt
2. **Desktop**: Extension API → WalletConnect → Install Prompt

### ✅ Error Handling
- Clear error messages if wallet not found
- Helpful links to download wallets
- Graceful fallback if connection fails

### ✅ Chain Support
Configured chains:
- **Ethereum Mainnet** (1)
- **Base** (8453)
- **Polygon** (137)

To add more chains, update the `chains` array in both `connectPhantom()` and `connectMetaMask()` functions.

## Configuration

### Environment Variables

Create or update `.env.local`:

```env
VITE_WALLETCONNECT_PROJECT_ID=5261912a5c184ed019675c830f491d1a
```

Get your own Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com):
1. Create free account
2. Create new project
3. Copy Project ID
4. Add to `.env.local`

### RPC Endpoints

Current RPC endpoints (in `WalletConnectModal.tsx`):
```javascript
rpcMap: {
  1: "https://eth-mainnet.g.alchemy.com/v2/demo",      // ETH
  8453: "https://mainnet.base.org",                     // Base
  137: "https://polygon-rpc.com",                       // Polygon
}
```

For production, replace demo endpoints with your own from:
- [Alchemy](https://www.alchemy.com/) - ETH, Base
- [QuickNode](https://www.quicknode.com/) - Any chain
- [Infura](https://infura.io/) - ETH

## Utility Functions

### `isMobileDevice()`
Detects if current user is on mobile device.

```typescript
if (isMobileDevice()) {
  // Show mobile-specific UI
}
```

### `initiateDeepLink(walletType)`
Initiates deep link to specified wallet app.

```typescript
initiateDeepLink("phantom");  // Opens Phantom app
initiateDeepLink("metamask"); // Opens MetaMask app
```

### `isWalletAppInstalled(walletType)`
Checks if wallet app is installed (async).

```typescript
const isPhantomInstalled = await isWalletAppInstalled("phantom");
if (isPhantomInstalled) {
  // Show Phantom option
}
```

## Troubleshooting

### Issue: Deep link doesn't work on iOS
- Ensure wallet app is installed
- Check Safari settings allow switching apps
- Try opening wallet app first, then returning to browser

### Issue: User stuck in wallet app
- Wallet app should provide back button
- User can manually navigate back in app browser
- Consider adding "Back" button in your app for explicit navigation

### Issue: Connection not confirmed
- Wait 2-3 seconds after app opens
- Some wallets require manual confirmation
- Check app notifications for permission requests

### Issue: Wrong chain connected
- User may have selected different chain in wallet
- Implement chain validation in your `onConnected` callback
- Request specific chain if needed

## Implementation Notes

### Connection Callbacks

The `onConnected` callback provides:
```typescript
onConnected(
  address: string,    // Connected wallet address
  wallet: WalletType  // "phantom" or "metamask"
)
```

Use this to:
- Save user session
- Fetch user data
- Update UI
- Redirect to dashboard

### Error Handling

Errors are displayed in the modal with:
- Clear message
- Installation link if needed
- User can retry or dismiss

### Mobile vs Desktop Detection

Current detection regex:
```
/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
```

Covers:
- ✅ iOS (iPhone, iPad, iPod)
- ✅ Android
- ✅ Old BlackBerry
- ✅ Opera Mini
- ✅ WebOS

## Best Practices

### 1. Add Back Navigation
```tsx
// Add "Back to Site" option in wallet modal
<button onClick={() => window.history.back()}>
  Back to Site
</button>
```

### 2. Handle App Closing
```tsx
useEffect(() => {
  // If user leaves app and returns to browser
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check if connection succeeded
      checkWalletConnection();
    }
  });
}, []);
```

### 3. Store Connection State
```tsx
// Save to localStorage for session persistence
localStorage.setItem('walletAddress', address);
localStorage.setItem('walletType', wallet);
```

### 4. Add Loading State
```tsx
// Show loading indicator while waiting for app
const [isWaitingForApp, setIsWaitingForApp] = useState(false);
```

## Security Notes

### ✅ Safe Practices Used
- No private key requests
- No seed phrases requested
- Only requests signing/transaction approval
- Uses industry-standard protocols (WalletConnect)
- HTTPS only in production

### ⚠️ Always Verify
- Check wallet address is valid format
- Validate transaction details before signing
- Use HTTPS in production
- Keep dependencies updated

## Supported Wallets

### Phantom
- ✅ iOS App
- ✅ Android App
- ✅ Browser Extension (Chrome, Firefox, Safari)
- ✅ Deep Link Support

### MetaMask
- ✅ iOS App
- ✅ Android App
- ✅ Browser Extension (Chrome, Firefox, Safari, Edge)
- ✅ Deep Link Support

## Future Enhancements

Consider adding:
1. **More Wallets**: Coinbase Wallet, WalletConnect, Trust Wallet
2. **Automatic Chain Selection**: Detect user's preferred chain
3. **Transaction History**: Show previous transactions
4. **Reconnection**: Auto-reconnect on page load if previously connected
5. **Hardware Wallet Support**: Ledger, Trezor via browser
6. **ENS Resolution**: Display ENS names instead of addresses

## Quick Reference

```typescript
// Check if mobile
if (isMobileDevice()) { }

// Initiate deep link
initiateDeepLink("phantom");

// Check if wallet installed
const installed = await isWalletAppInstalled("phantom");

// Truncate address for display
truncateAddress("0x1234567890123456789012345678901234567890");
// → "0x1234...7890"
```

## Support

For issues:
1. Check browser console (F12)
2. Verify wallet app is installed
3. Try on different device/browser
4. Check WalletConnect Project ID is correct
5. Review RPC endpoints are accessible

For more info:
- [Phantom Docs](https://docs.phantom.app/)
- [MetaMask Docs](https://docs.metamask.io/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
