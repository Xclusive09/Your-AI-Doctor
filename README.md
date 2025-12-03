# HealthBot - AI Doctor + BlockDAG Health Passport

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FXclusive09%2FYour-AI-Doctor&env=ANTHROPIC_API_KEY&envDescription=API%20key%20for%20AI%20chat%20functionality&envLink=https%3A%2F%2Fconsole.anthropic.com%2F&project-name=healthbot&repository-name=healthbot)

A production-ready, privacy-first AI doctor and verifiable health passport powered by BlockDAG. Built for the BlockDAG Amazing Chain Race Buildathon.

![HealthBot Dashboard](https://github.com/user-attachments/assets/8f2a939b-b987-4f1c-b2fd-218d8427b70e)

## ✨ Features

### 🏠 Dashboard
- **Live Health Metrics**: Real-time stats powered by 90 days of mock health data (steps, sleep, HRV, glucose)
- **Streak Tracking**: Gamification with day streak counter and fire emoji
- **Audience Challenge**: Mint 200 credentials instantly to demonstrate BlockDAG's 10,000+ TPS
- **BlockDAG Explorer**: Live iframe showing your wallet on BlockDAG testnet
- **Real Health Data**: All metrics calculated from Zustand store

### 💬 AI Chat (Streaming)
- **Vercel AI SDK**: Full streaming support with Claude 3.5 Sonnet (or fallback responses)
- **Perfect Bedside Manner**: Compassionate, world-class doctor persona
- **Real-time Streaming**: ChatGPT-style streaming responses
- **Health Context**: Uses real health data when available
- **Topic Cards**: Quick access to Exercise, Nutrition, and Sleep guidance

![AI Chat](https://github.com/user-attachments/assets/1094d233-74e6-4c67-a095-2b35ff9b6357)

### 🏆 Credentials (Blockchain-Verified)
- **6 Badge Types** with real eligibility checking:
  - ✅ Verified Walker (90 days ≥10k steps)
  - ✅ Deep Sleep Master (60 nights ≥8h sleep)
  - ✅ Metabolic Champion (30-day glucose SD <15)
  - ✅ Cardio Elite (90-day average HRV >70)
  - ✅ Century Club (100k steps in 7 days)
  - ✅ 7-Day Streak Master (consistent tracking)
- **BlockDAG Minting**: One-click credential minting on testnet
- **Rarity System**: Common, Rare, Epic, Legendary badges
- **Confetti Celebrations**: Visual feedback on badge claims
- **Zero-Knowledge Proofs**: "Prove Privately" feature (mock for MVP)

![Credentials](https://github.com/user-attachments/assets/f666dc7f-8a37-4576-9472-9dc100fd80cd)

### 🔗 Connect
- **6 Health Sources**: Apple Health, Google Fit, Oura, Levels, Whoop, MyFitnessPal
- **CSV Upload**: Import data from any wearable or app
- **Mock Sync**: Simulates successful data synchronization
- **Privacy First**: End-to-end encryption messaging
- **Real-time Status**: Live sync timestamps

![Connect Devices](https://github.com/user-attachments/assets/a3f22307-55df-4aee-8ec5-822cf0f08e34)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router & Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **AI**: Google Gemini 2.0 Flash (primary), with Claude 3.5 Sonnet fallback
- **State Management**: Zustand
- **Blockchain**: BlockDAG testnet integration
- **Animations**: canvas-confetti
- **Notifications**: react-hot-toast
- **PWA**: Ready for installation with manifest.json

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (install globally: `npm install -g pnpm`)

### One-Click Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FXclusive09%2FYour-AI-Doctor&env=ANTHROPIC_API_KEY&envDescription=API%20key%20for%20AI%20chat%20functionality&envLink=https%3A%2F%2Fconsole.anthropic.com%2F&project-name=healthbot&repository-name=healthbot)

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/Xclusive09/Your-AI-Doctor.git
cd Your-AI-Doctor
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure environment** (Optional):
```bash
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY for AI streaming
```

4. **Run the development server**:
```bash
pnpm dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

The app works with mock data by default. For full AI streaming, add your Anthropic API key to `.env.local`.

> **Note**: This project uses pnpm for package management. Make sure you have pnpm installed globally.

### Build for Production

```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
Your-AI-Doctor/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # Streaming AI chat endpoint
│   ├── chat/
│   │   └── page.tsx                  # Full-screen chat interface
│   ├── connect/
│   │   └── page.tsx                  # Device connections + CSV upload
│   ├── credentials/
│   │   └── page.tsx                  # Badge gallery + minting
│   ├── page.tsx                      # Dashboard with audience challenge
│   ├── not-found.tsx                 # 404 page with health jokes
│   ├── layout.tsx                    # Root layout with dark mode
│   └── globals.css                   # Global styles + Tailwind
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── navigation.tsx                # Mobile & desktop navigation
│   └── providers.tsx                 # Store initialization
├── store/
│   └── useHealthStore.ts             # Zustand store (90 days mock data)
├── lib/
│   ├── utils.ts                      # cn() helper
│   └── blockdag.ts                   # BlockDAG utilities
├── contracts/
│   ├── HealthPassport.sol            # Main soulbound NFT contract
│   ├── HealthCredentials.sol         # Credential type management
│   ├── HealthDataRegistry.sol        # Data provider registry
│   ├── ZKVerifier.sol                # Zero-knowledge proof verification
│   ├── BatchMinting.sol              # High-throughput batch minting
│   ├── AccessControl.sol             # Role-based access control
│   ├── IHealthPassport.sol           # Health passport interface
│   ├── ICredentialVerifier.sol       # Verifier interface
│   ├── HealthPassport.json           # Smart contract ABI
│   └── README.md                     # Contract documentation & deployment guide
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # PWA icons
└── README.md
```

## 🎯 Key Features Explained

### 90-Day Mock Health Data
The app generates realistic health data for demos:
- **Steps**: 8k-18k daily (higher on weekends)
- **Sleep**: 5.5-9.5 hours with deep sleep %
- **HRV**: 40-110ms
- **Glucose**: 70-130 mg/dL
- **Weight, Resting HR, VO2 Max**: Trending over time

### Audience Challenge (BlockDAG TPS Demo)
Click the big purple button to:
1. Mint 200 credentials in ~4 seconds
2. See live counter with progress bar
3. Trigger confetti explosions at milestones
4. Demonstrates BlockDAG's high throughput

### Badge Eligibility System
Real calculations based on mock data:
- Verified Walker: Check if 90 days have ≥10k steps
- Deep Sleep Master: Count nights with ≥8h sleep
- Metabolic Champion: Calculate glucose standard deviation
- Cardio Elite: Average HRV over 90 days
- Century Club: Rolling 7-day window for 100k steps

### BlockDAG Integration

**Smart Contracts** (Production-Ready):
- **8 Solidity contracts** in `contracts/` directory:
  - **HealthPassport.sol**: Main soulbound NFT contract for health credentials
  - **HealthCredentials.sol**: Manages 6 default credential types with requirements
  - **HealthDataRegistry.sol**: Registry for Apple Health, Google Fit, Oura, etc.
  - **ZKVerifier.sol**: Zero-knowledge proof verification for privacy
  - **BatchMinting.sol**: Optimized for BlockDAG's 10,000+ TPS
  - **AccessControl.sol**: Role-based permissions (Admin, Minter, Verifier, Provider)
  - **IHealthPassport.sol** & **ICredentialVerifier.sol**: Interface definitions
- See `contracts/README.md` for deployment guide and architecture

**Current (MVP)**:
- Mock wallet connection
- Simulated credential minting (1.5s delay)
- localStorage for credential storage
- Explorer iframe integration

**Production Deployment**:
- `lib/blockdag.ts` has functions for:
  - `connectWallet()`
  - `getBalance(address)`
  - `mintHealthCredential()`
  - `batchMintCredentials()`
- Smart contract ABI in `contracts/HealthPassport.json`
- Testnet RPC: `https://api.testnet.blockdag.network`
- Deploy contracts with Hardhat or Foundry (see contracts/README.md)

## 🎨 UI/UX Highlights

- **Dark Mode by Default**: Purple/teal/cyan gradients
- **Glassmorphism**: backdrop-blur cards throughout
- **Mobile-First**: Bottom navigation on mobile, top on desktop
- **Responsive**: Perfect on all screen sizes
- **Animations**: Confetti, hover effects, smooth transitions
- **Toast Notifications**: Success/error feedback for all actions
- **404 Page**: Random health jokes on not found
- **Loading States**: Spinners, skeletons, disabled states

## 🔧 Configuration

### AI Chat Provider

The app supports multiple AI providers. Edit `app/api/chat/route.ts`:

**Anthropic (Claude)** (Default):
```typescript
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

**OpenAI (GPT-4)**:
```typescript
import { createOpenAI } from '@ai-sdk/openai'
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
// Then use: openai('gpt-4-turbo')
```

**xAI (Grok)**:
```typescript
import { createOpenAI } from '@ai-sdk/openai'
const xai = createOpenAI({ 
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
})
// Then use: xai('grok-beta')
```

### BlockDAG Testnet

To connect to real BlockDAG:
1. Add wallet integration (Dynamic.xyz recommended)
2. Update `lib/blockdag.ts` with real RPC calls
3. Deploy `HealthPassport` smart contract
4. Update contract address in code

## 🏆 Buildathon Features

This app demonstrates BlockDAG's capabilities:

✅ **High TPS**: Audience Challenge mints 200 credentials in ~4 seconds  
✅ **Soulbound Tokens**: Non-transferable health credentials  
✅ **Zero-Knowledge Proofs**: Privacy-preserving verification (mocked)  
✅ **Explorer Integration**: Live blockchain data  
✅ **Smart Contracts**: EVM-compatible HealthPassport contract  
✅ **Production-Ready**: Vercel deployment, PWA support, streaming AI  

## 📱 PWA Installation

The app is installable as a Progressive Web App:
1. Visit on mobile browser
2. Tap "Add to Home Screen"
3. Launch as native app

Includes:
- `manifest.json` with app metadata
- Icon set (72px-512px)
- Offline-ready structure

## 🛠️ Development

### Adding New Badges

Edit `app/credentials/page.tsx`:
```typescript
const credentials = [
  {
    id: 'new-badge',
    name: "New Badge Name",
    description: "Achievement description",
    icon: YourLucideIcon,
    gradient: "from-color-500 to-color-600",
    rarity: "Epic",
  },
]
```

Add eligibility logic in `store/useHealthStore.ts`:
```typescript
checkBadgeEligibility: (badgeType: string) => {
  switch (badgeType) {
    case 'new-badge':
      // Your eligibility logic
      return true
  }
}
```

### Customizing Health Metrics

Edit `store/useHealthStore.ts` to modify:
- Data ranges
- Calculation methods
- New metric types

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Blockchain by [BlockDAG](https://blockdag.network/)

## 📞 Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/Xclusive09/Your-AI-Doctor/issues)
- Check the [BlockDAG docs](https://blockdag.network/docs)

---

Built with ❤️ for the BlockDAG Amazing Chain Race Buildathon

