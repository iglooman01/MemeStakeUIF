# Overview

This is a full-stack web application built with React and Express.js for "MemeStake" - a cryptocurrency staking platform focused on meme culture. The project implements a modern web application with a React frontend using shadcn/ui components and a Node.js backend with Express. The application includes features like multilingual support, dark/light theme switching, Web3 wallet connection (MetaMask, Trust Wallet, SafePal), and various interactive components for a crypto staking platform.

## $MEMES Token Information
- **Total Supply**: 50,000,000,000 (50 Billion) $MEMES tokens
- **Token Price**: $0.0001 per $MEMES
- **Public Sale**: 25 Billion tokens (50% of supply)
- **Raise Target**: $2,500,000
- **Network**: Binance Smart Chain Testnet (BSC Testnet / BEP-20) - Chain ID: 97 (for testing)
- **Purchase Limits**: Minimum $50, No maximum limit
- **Example**: $100 = 1,000,000 $MEMES tokens

## Staking & Rewards
- **Staking APY**: 350% APY (1% daily rewards)
- **Launch**: Immediately after airdrop completion
- **Minimum Staking Period**: 50 days for penalty-free unstake
- **Early Unstake Penalty**: All earned rewards deducted from principal if unstaked before 50 days
- **Staking Page**: Full featured stake/unstake interface at `/staking`
  - Smart contract approval flow
  - Gas fee estimation for all transactions
  - Real-time rewards tracking (daily, claimable, lifetime)
  - Claim rewards functionality with batching support
  - Early unstake warning with penalty calculation
- **Referral System**: 3-level structure
  - Level 1 (Direct): 5%
  - Level 2: 3%
  - Level 3: 2%
- **Referral Pool**: 5 Billion $MEMES (10% of total supply)
- **Referral Benefits**: Apply to both token purchases and staking rewards
- **Sponsor Wallet Logic**: Automatic sponsor detection with priority:
  1. Check `MEMES_Presale.referrerOf[connectedWallet]` on smart contract
  2. If not found, check URL query parameter `?ref={walletAddress}`
  3. If not found, use `MEMES_Presale.defaultReferrer` from contract
  - Uses viem library for contract interactions on BSC Testnet
- **Token Purchase Methods**: 
  - BNB: Direct calculation based on token price ($0.0001)
  - USDT(BEP20): Real-time estimation via `calculateMemesTokens` contract function
  - Contract automatically calculates optimal MEMES tokens for USDT payments
  - USDT Token Address: 0xa865e7988e121bac5c8eadb179a6cfe4e92f152e

# User Preferences

- **Communication Style**: Simple, everyday language
- **Design Philosophy**: Efficient, budget-friendly, no wasting time or money
- **UI/UX Approach**: Direct and simple - "just order and get result"

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Prepared for PostgreSQL sessions using connect-pg-simple
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server-side bundling

## Design System
- **Component Library**: Custom implementation using Radix UI primitives
- **Theme System**: CSS variables-based theming supporting light/dark modes
- **Color Palette**: Pure black (#000000) background with gold (#ffd700) accents
- **Typography**: System font stack for optimal performance
- **Layout**: Responsive design with mobile-first approach
- **Social Media**: Twitter, Telegram, YouTube, Medium integration

## Project Structure
- **Monorepo Structure**: Client and server code in separate directories
- **Shared Code**: Common schemas and types in `/shared` directory
- **Component Organization**: UI components in `/components/ui` with shadcn/ui structure
- **Asset Management**: Attached assets directory for static files

## Database Design
- **Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle migrations in `/migrations` directory  
- **User System**: Basic user table with username/password authentication
- **Type Safety**: Full TypeScript integration with Drizzle Zod schemas

## Development Workflow
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Type Checking**: Strict TypeScript configuration across the stack
- **Build Process**: Separate builds for client (Vite) and server (esbuild)
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js with TypeScript support
- **Build Tools**: Vite, esbuild, tsx for development

## UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for processing
- **Utilities**: class-variance-authority, clsx, tailwind-merge for styling utilities
- **Icons**: Lucide React for consistent iconography

## Database and ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod with Drizzle Zod integration
- **Session Storage**: connect-pg-simple for PostgreSQL session management

## Additional Features
- **Carousel**: Embla Carousel for image/content carousels
- **Date Handling**: date-fns for date manipulation
- **Command Palette**: cmdk for search and command interfaces
- **Development**: Replit-specific plugins for development environment integration

## Web3 Integration
- **Wallet Support**: MetaMask, Trust Wallet, SafePal
- **Network**: Binance Smart Chain Testnet (BSC Testnet / BEP-20) - Chain ID: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Explorer**: https://testnet.bscscan.com/
- **Smart Contracts** (Testnet - for testing):
  - **MEMES Token**: 0xBaF3c31BfA0ee3990A43b5cD4C0D4C7E0cFE5AcF
  - **MEMES Presale**: 0x4534a6d5bF5834fa890DD1650CFB354699a07083
  - Note: Deploy new contracts on BSC Testnet for proper testing
- **Features**: 
  - Wallet connection with network auto-switch to BSC Testnet
  - Connected wallet display with address truncation
  - Disconnect functionality with session cleanup
  - Automatic redirect to dashboard on connection
- **Configuration**: 
  - Web3 wallet connection: `client/src/config/web3Config.ts`
  - Contract addresses & ABIs: `client/src/config/contracts.ts`

## TypeScript and Tooling
- **TypeScript**: Strict configuration with path mapping
- **Linting**: Configured for React and Node.js environments
- **Module System**: ES modules throughout the application