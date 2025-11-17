# HealthBot - AI Doctor + BlockDAG Health Passport

A sleek, modern Next.js 15 web application that combines AI-powered health assistance with blockchain-verified health credentials. Built with the App Router, TypeScript, Tailwind CSS, and shadcn/ui components.

![HealthBot Dashboard](https://github.com/user-attachments/assets/8f2a939b-b987-4f1c-b2fd-218d8427b70e)

## Features

### 🏠 Dashboard
- **Health Metrics Cards**: Display key health stats (Health Score, Heart Rate, Daily Steps, Active Minutes)
- **Streak Tracking**: Gamification with day streak counter
- **Community Challenges**: Join health challenges with other users
- **Gradient UI**: Beautiful glassmorphism effects with smooth animations

### 💬 AI Chat
- **Full-screen Chat Interface**: ChatGPT-style UI for health conversations
- **Intelligent Responses**: Context-aware health advice on exercise, nutrition, sleep, stress, and more
- **Real-time Messaging**: Smooth message flow with user and assistant avatars
- **Quick Topics**: Pre-defined health topic cards for easy access

![AI Chat](https://github.com/user-attachments/assets/1094d233-74e6-4c67-a095-2b35ff9b6357)

### 🏆 Credentials
- **Badge Gallery**: Visual display of earned health achievements
- **BlockDAG Verification**: Cryptographically verified credentials on blockchain
- **Progress Tracking**: See percentage of badges earned
- **Locked Achievements**: Motivational display of future badges to earn

![Credentials](https://github.com/user-attachments/assets/f666dc7f-8a37-4576-9472-9dc100fd80cd)

### 🔗 Connect
- **Device Integration**: Connect Apple Health, Fitbit, Google Fit, Oura Ring, Whoop, MyFitnessPal
- **Connection Status**: Visual indicators for active and available connections
- **Mock Health Sources**: Interactive connect/disconnect functionality
- **Privacy Information**: Clear privacy and security messaging

![Connect Devices](https://github.com/user-attachments/assets/a3f22307-55df-4aee-8ec5-822cf0f08e34)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui components
- **Icons**: Lucide React
- **AI Integration**: Vercel AI SDK (expandable to OpenAI, Anthropic, etc.)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Xclusive09/Your-AI-Doctor.git
cd Your-AI-Doctor
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Your-AI-Doctor/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   ├── chat/
│   │   └── page.tsx              # Chat interface
│   ├── connect/
│   │   └── page.tsx              # Device connections
│   ├── credentials/
│   │   └── page.tsx              # Badge gallery
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard
├── components/
│   ├── ui/
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   └── navigation.tsx            # Main navigation
├── lib/
│   └── utils.ts                  # Utility functions
└── public/
```

## Key Features Explained

### Glassmorphism Design
The app uses modern glassmorphism effects with:
- Backdrop blur effects
- Semi-transparent backgrounds
- Layered card designs
- Smooth gradient overlays

### Responsive Navigation
- Mobile: Bottom navigation bar
- Desktop: Top navigation bar
- Active state highlighting
- Smooth transitions

### AI Health Assistant
The chat endpoint provides intelligent health responses based on keywords:
- Exercise and fitness advice
- Nutrition guidance
- Sleep recommendations
- Stress management tips
- Heart health information

### BlockDAG Integration Concept
While currently using mock data, the credentials system is designed for:
- Zero-knowledge proof verification
- Cryptographic credential storage
- Tamper-proof achievement records
- Privacy-preserving health data

## Customization

### Adding Real AI Integration

To connect to a real AI provider (OpenAI, Anthropic Claude, etc.):

1. Install the provider SDK:
```bash
npm install @ai-sdk/openai
# or
npm install @ai-sdk/anthropic
```

2. Add your API key to `.env.local`:
```
OPENAI_API_KEY=your_key_here
```

3. Update `app/api/chat/route.ts` to use streaming AI responses

### Modifying Health Metrics

Edit the stats array in `app/page.tsx` to customize:
- Metric titles
- Values and units
- Icons and gradients
- Descriptions

### Adding More Badges

Extend the credentials array in `app/credentials/page.tsx` with:
- New achievement names
- Custom descriptions
- Unique icons
- Gradient colors

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
