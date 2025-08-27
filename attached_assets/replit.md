# MemeStake - Crypto Dashboard Application

## Overview

MemeStake is a full-stack web application that appears to be a cryptocurrency or meme token dashboard with features for email verification, task completion, wallet management, and user statistics tracking. The application is built with a modern tech stack featuring React with TypeScript on the frontend and Express.js on the backend, with a focus on user engagement through gamified task completion and token management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Component-based UI with type safety using React 18 and TypeScript
- **Vite Build System**: Fast development server and optimized production builds
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: React Query (TanStack Query) for server state management and API data fetching
- **UI Components**: Comprehensive design system built on Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for JSON parsing and request logging
- **TypeScript**: Full type safety across the backend codebase
- **Modular Routing**: Route registration system with centralized API endpoint management
- **Storage Layer**: Abstracted storage interface with in-memory implementation, designed for easy database integration
- **Development Integration**: Vite middleware integration for seamless full-stack development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions in shared directory for frontend/backend consistency
- **Migrations**: Database migration system using Drizzle Kit
- **Connection**: Neon Database serverless PostgreSQL integration
- **Validation**: Zod schemas for runtime type validation and API contracts

### Authentication and Authorization
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **User Schema**: Basic user model with username/password authentication
- **Type Safety**: Shared TypeScript types between frontend and backend for user data

### External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Radix UI**: Accessible component primitives for the design system
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support
- **React Query**: Server state management and caching
- **Date-fns**: Date manipulation and formatting utilities
- **Embla Carousel**: Touch-friendly carousel component
- **Lucide React**: Icon library for consistent iconography

The application follows a clean architecture pattern with clear separation between presentation, business logic, and data layers. The shared schema approach ensures type consistency across the full stack, while the modular component structure supports maintainability and scalability.