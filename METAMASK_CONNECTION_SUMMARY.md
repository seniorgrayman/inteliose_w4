# Quick Summary - Current MetaMask Connection Implementation

## File: `src/components/WalletConnectModal.tsx`

### MetaMask Connection Function: `connectMetaMask()`

**Flow:**
1. Check for `window.ethereum?.isMetaMask`
2. Call `eth_requestAccounts`
3. Store address & type in localStorage
4. Call `onConnected(address, "metamask")`

**Mobile Fallback:**
- Try WalletConnect first (with chainId: 1, 8453, 137)
- Then try deep link: `metamask://dapp/{hostname}{pathname}`
- Show error if both fail

### Key Methods Used:
```typescript
// Desktop
evmProvider.request({ method: "eth_requestAccounts" })

// Mobile (WalletConnect)
new Provider({ projectId, chains: [1, 8453, 137], ... })
provider.enable()

// Mobile (Deep Link)
window.location.href = `metamask://dapp/${window.location.hostname}${window.location.pathname}`
```

### Storage Keys:
```typescript
localStorage.setItem("walletAddress", accounts[0])
localStorage.setItem("walletType", "metamask")
```

---

## Potential Issues to Fix:

1. ⚠️ **WalletConnect wallet type mismatch** - Uses WalletConnect but labeled as MetaMask
2. ⚠️ **Deep link callback missing** - No proper handling when user returns from wallet app
3. ⚠️ **Chain detection** - Hardcoded chains, no dynamic switching
4. ⚠️ **Error clarity** - Mobile fallback errors not always clear to user

---

Ready to compare and fix when you pull the flawed code!
