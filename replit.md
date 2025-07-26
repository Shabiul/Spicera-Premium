# Spicera Premium - Spice Company Website

## Overview

This is a modern, responsive website for a premium spice company called "Spicera Premium". The application is built as a full-stack web application showcasing spice products with a contact form functionality. It features a beautiful design with sections for hero content, product showcases, company story, quality information, testimonials, and contact forms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom color scheme for spice-themed branding
- **UI Components**: Radix UI components with custom shadcn/ui implementation
- **State Management**: React Hook Form for form handling, TanStack Query for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Development**: tsx for TypeScript execution in development
- **Storage**: Currently using in-memory storage (MemStorage) with interface for future database integration

### Key Components

#### Frontend Structure
- Single-page application with section-based navigation
- Responsive design with mobile-first approach
- Custom color scheme with spice-themed variables (browns, golds, creams)
- Component-based architecture with reusable UI elements

#### Backend Structure
- RESTful API endpoints for contact form submissions
- Modular route handling with Express
- Storage abstraction layer for easy database integration
- Error handling and validation with Zod schemas

## Data Flow

1. **Contact Form Submission**:
   - User fills contact form on frontend
   - Form validation using react-hook-form with Zod resolver
   - Data sent to `/api/contact` endpoint via POST
   - Backend validates data using shared Zod schema
   - Contact submission stored in memory storage
   - Success/error response sent back to frontend

2. **Contact Submissions Retrieval**:
   - Admin endpoint `/api/contact-submissions` to view all submissions
   - Currently no authentication (future enhancement needed)

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with extensive Radix UI component library
- **Styling**: Tailwind CSS with PostCSS processing
- **Forms**: React Hook Form with Hookform resolvers
- **HTTP Client**: Native fetch API with TanStack Query wrapper
- **Icons**: Lucide React icons
- **Utilities**: clsx, class-variance-authority for styling utilities

### Backend Dependencies
- **Web Framework**: Express.js
- **Database ORM**: Drizzle ORM (configured for PostgreSQL but not currently used)
- **Database Driver**: Neon Database serverless driver
- **Validation**: Zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session storage (not active)

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development**: tsx for TypeScript execution, Replit-specific tooling

## Deployment Strategy

The application uses a monorepo structure with:

- **Development**: `npm run dev` runs the backend server with Vite middleware for hot reloading
- **Production Build**: `npm run build` creates optimized frontend bundle and backend JavaScript
- **Production Start**: `npm start` runs the compiled backend serving static frontend files
- **Database**: `npm run db:push` for schema migrations (when database is connected)

### File Structure
- `/client`: Frontend React application
- `/server`: Backend Express application
- `/shared`: Shared TypeScript schemas and types
- `/migrations`: Database migration files (for future use)

### Database Integration
The application is prepared for PostgreSQL integration using Drizzle ORM:
- Schema defined in `/shared/schema.ts`
- Migration configuration in `drizzle.config.ts`
- Currently using in-memory storage with interface for easy database swap
- Environment variable `DATABASE_URL` expected for database connection

### Environment Configuration
- Development and production modes supported
- Replit-specific configuration for development environment
- Database URL configuration for production deployment