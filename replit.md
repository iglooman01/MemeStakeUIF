# Overview

MemeStake is a full-stack web application for a cryptocurrency staking platform built around meme culture. It features a React frontend and an Express.js backend, offering multilingual support, theme switching, and Web3 wallet integration (MetaMask, Trust Wallet, SafePal). The platform allows users to purchase and stake $MEMES tokens, earn daily rewards (350% APY / 1% daily), and benefit from a 3-level referral system. Key capabilities include real-time rewards tracking, a comprehensive staking interface, and an airdrop claiming mechanism. The project aims to provide an accessible and engaging staking experience for meme token enthusiasts.

## $MEMES Token Information
- **Total Supply**: 1,000,000,000,000 $MEMES tokens
- **Token Price**: $0.0001 per $MEMES
- **Airdrop**: 100 Billion tokens (10% of supply)
- **Public Sale**: 500 Billion tokens (50% of supply)
- **Network**: Binance Smart Chain Testnet (BSC Testnet / BEP-20)

## Staking & Rewards
- **Staking APY**: 350% APY (1% daily rewards)
- **Minimum Staking Period**: 50 days for penalty-free unstake
- **Early Unstake Penalty**: All earned rewards deducted if unstaked before 50 days
- **Referral System**: Direct referral rewards (10,000 $MEMES per referral)
  - Reward given when referred user completes email verification
  - One wallet = one referral reward (non-repeatable)
  - Referrer must be a verified participant in the database
  - Sponsor code can be wallet address or referral code (e.g., MEMESXXXXXX)
- **Token Purchase Methods**: BNB and USDT (BEP20)

# User Preferences

- **Communication Style**: Simple, everyday language
- **Design Philosophy**: Efficient, budget-friendly, no wasting time or money
- **UI/UX Approach**: Direct and simple - "just order and get result"

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Database ORM**: Drizzle ORM for PostgreSQL
- **Session Management**: Configured for PostgreSQL sessions
- **Development**: `tsx` for TypeScript execution
- **Production**: `esbuild` for server bundling

## Design System
- **Component Library**: Custom using Radix UI primitives
- **Theme System**: CSS variables-based light/dark modes
- **Color Palette**: Pure black background, gold accents
- **Typography**: System font stack
- **Layout**: Responsive, mobile-first design

## Project Structure
- **Monorepo**: Separate client and server directories, shared code in `/shared`.
- **Pages**: Home, Dashboard, Staking, Airdrop, Whitepaper, Income History.

## Database Design
- **Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle migrations
- **User System**: Basic user authentication
- **Transaction Tracking**: Database table for blockchain transactions (Stake, Claim, Capital Withdraw) with status tracking.

## System Design Choices
- **Web3 Integration**: Wallet connection with network auto-switch to BSC Testnet, connected wallet display, disconnect functionality.
- **Airdrop Claim**: Dashboard integration to check claim status and execute `claimAirdrop()` via smart contract.
  - **Conditional Flow**:
    - If `airdropClaimed === true`: Show success message with transaction hash and referral promotion
    - Else if `userClaimableAmount > 0`: Direct claim button (bypasses email verification and tasks)
    - Else: Show complete verification process (email OTP + social media tasks)
  - **Email Verification**: Maileroo OTP verification for users without claimable amount
    - Send 6-digit OTP to email with 10-minute expiration
    - Email uniqueness enforced in database (one email per wallet)
    - Sponsor/referral code captured during OTP send
    - Update email_verified status on successful verification
  - **Balance Verification**: Checks if airdrop contract has sufficient MEMES tokens before claiming
  - **Auto-refresh**: After successful claim, automatically refreshes token balances, staking data, and airdrop status
- **Airdrop Export Scheduler**: Automated Node.js scheduler that exports verified participants to smart contract
  - Runs every hour
  - Fetches up to 100 users per batch where: email_verified=true, all tasks completed, exported=false
  - Executes `allowAirdrop(users[], sponsors[])` on Airdrop contract using admin wallet
  - Updates `exported=true` in database after successful transaction
  - Uses ADMIN_PRIVATE_KEY for transaction signing
- **Staking Data**: Uses `getActiveStakesWithId()` and `getPendingRewards()` for efficient and accurate staking information.
- **Wallet Change Detection**: Auto-refreshes dashboard data on wallet switch using `accountsChanged` event.
- **Security**: Wallet address validation using `isValidEthereumAddress()` and removal of demo mode.
- **Branding**: "MEMES STAKE" branding with bold gold styling and consistent design.

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js
- **Build Tools**: Vite, esbuild, tsx

## Email Services
- **Maileroo**: Email OTP verification service for airdrop claims
  - API Key authentication
  - 6-digit OTP generation and delivery
  - 10-minute OTP expiration

## UI and Styling
- **Component Library**: Radix UI
- **Styling**: Tailwind CSS, PostCSS
- **Utilities**: `class-variance-authority`, `clsx`, `tailwind-merge`
- **Icons**: Lucide React

## Database and ORM
- **Database Provider**: Neon Database (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM, Drizzle Kit
- **Validation**: Zod
- **Session Storage**: `connect-pg-simple`

## Web3 Integration
- **Wallet Support**: MetaMask, Trust Wallet, SafePal
- **Network**: Binance Smart Chain Testnet (BSC Testnet / BEP-20) - Chain ID: 97
- **RPC URL**: `https://data-seed-prebsc-1-s1.binance.org:8545/`
- **Explorer**: `https://testnet.bscscan.com/`
- **Smart Contracts** (BSC Testnet):
  - **MEMES Token**: `0xBaF3c31BfA0ee3990A43b5cD4C0D4C7E0cFE5AcF`
  - **MEMES Presale**: `0x4534a6d5bF5834fa890DD1650CFB354699a07083`
  - **MEMES Stake**: `0x09EB3f7E23ae0c6987bFd1757cB814E6dC95dbFB`

## Additional Features
- **Carousel**: Embla Carousel
- **Date Handling**: `date-fns`
- **Command Palette**: `cmdk`