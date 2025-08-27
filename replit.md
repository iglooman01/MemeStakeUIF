# Overview

This is a full-stack web application built with React and Express.js for "MemeStake" - a cryptocurrency staking platform focused on meme culture. The project implements a modern web application with a React frontend using shadcn/ui components and a Node.js backend with Express. The application includes features like multilingual support, dark/light theme switching, and various interactive components for a crypto staking platform.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Color Palette**: Banana yellow (#F6C833) as primary color with neutral base
- **Typography**: System font stack for optimal performance
- **Layout**: Responsive design with mobile-first approach

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

## TypeScript and Tooling
- **TypeScript**: Strict configuration with path mapping
- **Linting**: Configured for React and Node.js environments
- **Module System**: ES modules throughout the application