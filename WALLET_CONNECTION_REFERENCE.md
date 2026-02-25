# Wallet Connection Reference - Current Implementation

## Overview
The current wallet connection system handles both MetaMask and Phantom wallets with fallbacks for mobile and desktop environments.

## File Structure
- **`src/components/WalletConnectModal.tsx`** - Main wallet connection UI and logic
- **`src/lib/web3modal.ts`** - Web3Modal configuration
- **`src/hooks/useWalletConnection.ts`** - Currently empty (placeholder)

---

## MetaMask Connection Flow (Current Implementation)

### 1. **Desktop Connection**
```typescript
const evmProvider = (window as any)?.ethereum;
if (evmProvider?.isMetaMask) {
  try {
    const accounts = await evmProvider.request({ method: "eth_requestAccounts" });
    if (accounts?.[0]) {
      localStorage.setItem("walletAddress", accounts[0]);
      localStorage.setItem("walletType", "metamask");
      onConnected(accounts[0], "metamask");
      onClose();
      return;
    }
  } catch (e: any) {
    // Handle error for non-mobile
    if (!isMobile) {
      setError(e?.message || "Connection rejected.");
      setConnecting(null);
      return;
    }
  }
}
```

**Key Points:**
- Checks for `window.ethereum.isMetaMask` to verify MetaMask is installed
- Uses `eth_requestAccounts` to request account access
- Stores address and wallet type in localStorage
- Returns immediately on success
- Shows error on desktop if user rejects

### 2. **Mobile Connection (Fallback Chain)**
```typescript
if (isMobile) {
  try {
    // Step 1: Try WalletConnect
    const Provider = await initWalletConnect();
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    
    const provider = new Provider({
      projectId: projectId || "5261912a5c184ed019675c830f491d1a",
      chains: [1, 8453, 137],
      rpcMap: {
        1: "https://eth-mainnet.g.alchemy.com/v2/demo",
        8453: "https://mainnet.base.org",
        137: "https://polygon-rpc.com",
      },
      methods: ["eth_sendTransaction", "eth_signTransaction", "personal_sign", "eth_sign"],
    });

    await provider.enable();
    const accounts = provider.accounts;
    
    if (accounts?.[0]) {
      localStorage.setItem("walletAddress", accounts[0]);
      localStorage.setItem("walletType", "metamask");
      onConnected(accounts[0], "metamask");
      onClose();
      return;
    }
  } catch (wcError: any) {
    // Step 2: Fallback to Deep Link
    try {
      initiateDeepLink("metamask");
      return;
    } catch (e) {
      setError("MetaMask not found. Install from: https://metamask.io");
      setConnecting(null);
      return;
    }
  }
}
```

**Mobile Fallback Chain:**
1. **WalletConnect** - Try to connect via WalletConnect protocol
   - Supports chains: Ethereum (1), Base (8453), Polygon (137)
   - RPC endpoints configured for each chain
   - Methods: eth_sendTransaction, eth_signTransaction, personal_sign, eth_sign
2. **Deep Link** - If WalletConnect fails, redirect to MetaMask app
   - Uses: `metamask://dapp/${window.location.hostname}${window.location.pathname}`
3. **Error** - If both fail, show error message

---

## Phantom Connection Flow (Current Implementation)

### 1. **Desktop Connection**
```typescript
const solanaProvider = (window as any)?.phantom?.solana;
if (solanaProvider?.isPhantom) {
  try {
    const resp = await solanaProvider.connect();
    const address = resp.publicKey.toString();
    localStorage.setItem("walletAddress", address);
    localStorage.setItem("walletType", "phantom");
    onConnected(address, "phantom");
    onClose();
    return;
  } catch (e: any) {
    if (!isMobile) {
      setError(e?.message || "Connection rejected.");
      setConnecting(null);
      return;
    }
  }
}
```

**Key Points:**
- Checks for `window.phantom.solana.isPhantom`
- Uses Phantom-specific `connect()` method
- Extracts address from `publicKey.toString()`

### 2. **Mobile Connection (Fallback Chain)**
Same as MetaMask mobile fallback - WalletConnect first, then deep link.

---

## Local Storage Keys
```typescript
localStorage.setItem("walletAddress", address);  // User's wallet address
localStorage.setItem("walletType", "metamask" | "phantom");  // Wallet type identifier
```

---

## Mobile Detection
```typescript
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
```

---

## Deep Link Configuration

### MetaMask Deep Link
```typescript
window.location.href = `metamask://dapp/${window.location.hostname}${window.location.pathname}`;
```

### Phantom Deep Link
```typescript
const deeplink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
window.location.href = deeplink;
```

---

## Web3Modal Configuration
```typescript
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5261912a5c184ed019675c830f491d1a';
const metadata = {
  name: 'Inteliose',
  description: 'Inteliose App',
  url: 'https://inteliose.com',
  icons: ['https://inteliose.com/favicon.ico']
};
const chains = [mainnet, base];
```

---

## Known Issues & Areas for Improvement

### 1. **WalletConnect Wallet Type Mismatch (Mobile)**
- When WalletConnect is used on mobile for Phantom, it stores `walletType: "phantom"` 
- But uses generic WalletConnect provider, not Phantom-specific provider
- Same issue for MetaMask - uses WalletConnect but labels as MetaMask
- **Problem**: Subsequent wallet operations may expect wallet-specific methods that aren't available

### 2. **Deep Link Callback Handling**
- Deep links redirect to the wallet app, then back to the website
- No proper callback/event handling to detect when user returns with a connection
- Connection state isn't properly managed after deep link redirect

### 3. **Error Handling Gap**
- Desktop non-mobile errors are caught, but mobile fallback errors aren't always clear
- User might not know if connection failed vs. trying deep link

### 4. **Chain Detection**
- WalletConnect is hardcoded to chains [1, 8453, 137]
- No dynamic chain selection based on current app context
- No switching between chains if user is on wrong chain

---

## Ready for Fixes
I have documented:
✅ MetaMask connection flow (desktop & mobile)
✅ Phantom connection flow (desktop & mobile)
✅ Local storage key usage
✅ Mobile detection logic
✅ Deep link handling
✅ WalletConnect configuration
✅ Known issues and flaws

When you're ready to pull the flawed code, I can compare it against this reference and apply fixes!
