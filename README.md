<p align="center">
  <img src="https://img.shields.io/badge/Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" alt="Base Chain" />
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=000" alt="Firebase" />
</p>

# Inteliose

**Autonomous on-chain intelligence agent for token risk profiling, failure-mode detection, and multi-chain analysis.**

Inteliose is a Web3-native intelligence platform that provides structural risk analysis for tokens across Base and Solana. It operates as an autonomous agent with A2A (Agent-to-Agent) communication capabilities, ERC-8004 identity registration, and a token-burn access model that aligns user incentives with protocol sustainability.

---

## Table of Contents

- [Overview](#overview)
- [Core Modules](#core-modules)
- [Architecture](#architecture)
- [Token Burn Access Model](#token-burn-access-model)
- [A2A Protocol & Agent Identity](#a2a-protocol--agent-identity)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Inteliose surfaces what dashboards don't — structural fragility, attention decay patterns, insider optics, and liquidity risk zones. Rather than aggregating surface-level metrics, the platform applies multi-layered analysis to identify failure modes before they materialize.

### Key Capabilities

- **Multi-chain token analysis** across Base (EVM) and Solana ecosystems
- **Security scanning** for proxy contracts, hidden owners, mintable tokens, and suspicious functions
- **AI-powered diagnostics** with founder-level risk recommendations
- **Real-time memecoin launch tracking** via Clawnch integration
- **Agent-to-Agent (A2A)** communication over JSON-RPC 2.0
- **ERC-8004 agent identity** with on-chain reputation tracking
- **Token burn access model** — burn-to-query mechanism on Base chain

---

## Core Modules

### Profile Engine

Structured project profiling through a multi-step onboarding flow. Captures token address, launch platform, project category, stage (pre-launch, live, post-launch, revival), and intent horizon. Builds a comprehensive profile that informs downstream analysis.

**Supported launch platforms:** Pump.fun, Bags, Raydium, Moonshot, LaunchMyToken

**Project categories:** AI, Meme, DeFi, GameFi, NFT, SocialFi, DAO, Utility

### Risk Baseline Scanner

Detects fragility zones and structural weaknesses across multiple dimensions:

| Check | Description |
|-------|-------------|
| Holder Distribution | Concentration risk and whale exposure |
| Liquidity Depth | Lock status, LP composition, withdrawal risk |
| Contract Security | Proxy detection, hidden ownership, mint functions |
| Tax Structure | Buy/sell tax analysis and honeypot indicators |
| Transfer Controls | Pausable transfers, blacklists, cooldowns |
| Market Metrics | Volume-to-liquidity ratios, price stability |

Risk levels are classified as **Low**, **Moderate**, **Elevated**, or **Critical**.

### Failure Mode Detection

Surfaces behavioral and structural patterns that precede token failure:

- **Attention Decay** — declining social and volume momentum
- **Liquidity Fragility** — thin order books and LP concentration
- **Insider Optics** — wallet clustering and coordinated activity patterns

### Token Safety Checklist

A 6-phase verification framework with 27 individual checks:

1. Token Safety & Setup (8 checks)
2. Liquidity & Lock Status (4 checks)
3. Holder Distribution (4 checks)
4. Market Metrics (4 checks)
5. Team & Community (4 checks)
6. Final Risk Assessment (3 checks)

Progress is tracked per-project with section-level gating.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Dashboard · Analysis · Projects · Checklist · A2A   │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌─────────┐  ┌───────────┐  ┌─────────┐
   │ Burn API │  │ Intel API │  │  A2A    │
   │ /api/burn│  │ /api/intel│  │ /api/a2a│
   └────┬─────┘  └─────┬─────┘  └────┬────┘
        │              │              │
   ┌────▼─────┐  ┌─────▼─────┐  ┌────▼────────┐
   │ Firestore │  │DexScreener│  │ JSON-RPC 2.0│
   │ Base RPC  │  │ QuickNode │  │  Agent Mesh  │
   └───────────┘  │ Gemini AI │  └─────────────┘
                  └───────────┘
```

**Frontend:** React 18 with TypeScript, Vite, TailwindCSS, Radix UI primitives, and Framer Motion animations.

**Backend:** Vercel serverless functions handling burn transactions, agent communication, and token intelligence endpoints.

**Data Layer:** Firebase Firestore for project persistence and burn transaction records. On-chain data fetched via DexScreener, QuickNode RPC, and Base RPC endpoints.

---

## Token Burn Access Model

Inteliose implements a burn-to-query model where users burn ERC-20 tokens on Base to access analysis. This creates a deflationary feedback loop that aligns usage with token value.

### How It Works

1. **Estimate** — Query complexity is analyzed and a burn cost is calculated in USD, then converted to tokens using live DexScreener pricing
2. **Confirm** — User reviews the burn amount, their token balance, and USD cost in a confirmation modal
3. **Execute** — An ERC-20 `transfer` to the dead address (`0x...dEaD`) is signed via the user's wallet (Phantom or MetaMask)
4. **Verify** — The transaction is verified on-chain by checking the `Transfer` event logs against the burn record

### Complexity Tiers

| Tier | Multiplier | Example Queries |
|------|-----------|-----------------|
| Simple | 1x | Basic token lookups |
| Medium | 3x | Multi-metric analysis |
| Complex | 10x | Trend forecasting, signal detection |
| Very Complex | 32x | Backtesting, portfolio optimization |

Resource multipliers are applied additively: real-time data (+50%), historical data (+30%), multi-market analysis (+40%).

---

## A2A Protocol & Agent Identity

### Agent-to-Agent Communication

Inteliose exposes a JSON-RPC 2.0 endpoint at `/a2a` for inter-agent communication. Other agents can request token health checks, risk baselines, and failure mode analysis programmatically.

**Declared Skills:**
- `token-health-check` — Multi-chain token safety analysis
- `risk-baseline` — Structural risk profiling

### ERC-8004 Registration

The agent is registered under the ERC-8004 identity standard with:
- A discoverable agent card at `/.well-known/agent-card.json`
- Registration metadata at `/erc8004-registration.json`
- On-chain reputation tracking and agent lookup capabilities

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18, TypeScript 5.8, Vite 5.4 |
| **Styling** | TailwindCSS 3.4, Radix UI, Framer Motion |
| **Web3** | Wagmi 3.5, Viem 2.46, Web3Modal, WalletConnect |
| **Data** | TanStack React Query, Zod, React Hook Form |
| **Charts** | Recharts 2.15 |
| **Backend** | Vercel Serverless Functions, Firebase Firestore |
| **AI** | Gemini 2.5 Flash |
| **Chain Data** | DexScreener API, QuickNode RPC, Base RPC |
| **Testing** | Vitest 3.2 |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A wallet browser extension (Phantom or MetaMask)

### Installation

```bash
# Clone the repository
git clone https://github.com/QuinanceFinance/inteliose.git

# Navigate to the project directory
cd inteliose

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

### Local Development

The development server includes a built-in Vite plugin that handles burn API routes locally — no additional backend server is required. All burn endpoints (`/api/burn/*`) are served directly by the Vite dev server.

For the full intelligence backend (token analysis, A2A, agent endpoints), run the Inteliose backend server on port 3001. The Vite config automatically proxies `/api/intel/*` and `/api/a2a` requests.

---

## Project Structure

```
inteliose/
├── api/                          # Vercel serverless functions
│   ├── a2a.ts                    # A2A JSON-RPC 2.0 endpoint
│   ├── health.ts                 # Health check
│   ├── well-known/               # Agent discovery
│   │   └── agent-card.ts
│   ├── burn/                     # Burn-to-query system
│   │   ├── estimate.ts
│   │   ├── submit.ts
│   │   └── process.ts
│   ├── intel/                    # Intelligence endpoints
│   │   ├── erc8004/              # Agent identity & reputation
│   │   └── a2a/                  # A2A stats & tasks
│   └── _lib/                     # Shared utilities
│       ├── cors.ts
│       ├── firebase.ts
│       ├── rate-limit.ts
│       ├── rpc.ts
│       ├── price.ts
│       └── complexity.ts
├── src/
│   ├── components/               # UI components
│   │   ├── BurnConfirmModal.tsx
│   │   ├── WalletConnectModal.tsx
│   │   ├── AgentStatusCard.tsx
│   │   ├── A2AActivityFeed.tsx
│   │   ├── AgentCardPreview.tsx
│   │   ├── ConLaunchLiveSection.tsx
│   │   ├── OnboardingWizard.tsx
│   │   └── ui/                   # Radix-based primitives
│   ├── hooks/                    # Custom React hooks
│   │   ├── useBurn.ts
│   │   └── useWalletConnection.ts
│   ├── lib/                      # Core libraries
│   │   ├── tokendata.ts          # Multi-chain token fetching
│   │   ├── conlaunch.ts          # Memecoin launch tracking
│   │   ├── inteliose-api.ts      # Backend API client
│   │   └── firebase/             # Firebase client & Firestore ops
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx             # Landing page
│   │   ├── Dashboard.tsx         # Analysis dashboard
│   │   ├── ManageProject.tsx     # Project management
│   │   ├── ProjectDetail.tsx     # Full project analysis
│   │   └── ChecklistPage.tsx     # Token safety checklist
│   ├── services/
│   │   └── burnService.ts        # Burn transaction orchestration
│   └── types/                    # TypeScript definitions
│       ├── burn.ts
│       ├── wallet.ts
│       └── profile.ts
├── vite.config.ts                # Vite configuration
├── vite-burn-api.ts              # Dev-only burn API plugin
├── vercel.json                   # Vercel routing & rewrites
└── package.json
```

---

## Deployment

The application is deployed on **Vercel** with automatic deployments from the main branch.

- **Frontend** is built by Vite and served as a static SPA
- **API routes** in `/api` are deployed as Vercel serverless functions
- **Routing** is handled by `vercel.json` rewrites — agent discovery endpoints (`/.well-known/agent-card.json`, `/erc8004-registration.json`, `/a2a`) are mapped to their respective serverless functions, with a catch-all for SPA routing

---

## Environment Variables

The following environment variables are required for deployment. All client-accessible variables use the `VITE_` prefix.

| Variable | Description |
|----------|-------------|
| `VITE_BURN_ENABLED` | Enable or disable the burn access gate |
| `VITE_BURN_TOKEN_ADDRESS` | ERC-20 token contract address on Base |
| `VITE_BURN_TOKEN_SYMBOL` | Token ticker symbol |
| `VITE_BURN_TOKEN_DECIMALS` | Token decimal precision |
| `VITE_BURN_USD_COST` | Base USD cost per query |
| `VITE_BURN_FALLBACK_TOKENS` | Fallback token amount when price unavailable |
| `VITE_BASE_RPC_URL` | Base chain RPC endpoint |
| `VITE_GEMINI_API_KEY_II` | Gemini AI API key for analysis |
| `VITE_QUICKNODE_API_KEY` | QuickNode RPC for Solana data |
| `VITE_ZERION_API_KEY_BASE` | Zerion API for Base token data |
| `VITE_INTELIOSE_AGENT_ID` | ERC-8004 agent registry ID |

---

## License

Proprietary. All rights reserved.

---

<p align="center">
  <strong>Built by <a href="https://github.com/QuinanceFinance">Quinance Finance</a></strong>
</p>
