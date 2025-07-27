# Spicera Premium - Premium Spice E-commerce Platform

## Quick Start

### For Windows Users

If you're getting the error `'NODE_ENV' is not recognized as an internal or external command`, you have a few options:

#### Option 1: Use cross-env (Recommended)
Since cross-env is already installed, modify your local package.json scripts to:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

#### Option 2: Use Windows Command Prompt syntax
```bash
# For development
set NODE_ENV=development && tsx server/index.ts

# Or use PowerShell syntax
$env:NODE_ENV="development"; tsx server/index.ts
```

#### Option 3: Use npm scripts directly
```bash
npm run dev
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   # Copy the example file and modify it
   cp .env.example .env
   # Edit .env with your actual database credentials
   ```
4. Set up your PostgreSQL database:
   
   **Option A: Using the SQL file directly**
   ```bash
   # Run the SQL setup file in your PostgreSQL database
   psql -U your_username -d your_database -f database-setup.sql
   ```
   
   **Option B: Using the Node.js setup script**
   ```bash
   # Make sure your .env file is configured, then run:
   node setup-database.js
   ```
   
   **Option C: Using Drizzle (for schema only, no initial data)**
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup Files

This project includes several database setup files:

- **`database-setup.sql`** - Complete SQL script that creates all tables and inserts the 4 masala products
- **`setup-database.js`** - Node.js script to run the SQL setup programmatically
- **`.env.example`** - Template for environment variables

### Environment Variables

Create a `.env` file in the root directory with:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/spicera_db

# PostgreSQL Connection Details
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=spicera_db

# Application Configuration
SESSION_SECRET=your-secure-session-secret
NODE_ENV=development
```

### Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared TypeScript types and schemas
- `/drizzle` - Database migrations (when using PostgreSQL)

### Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Development**: Vite, tsx

### Features

- 4 Premium masala products (Biryani, Korma, Garam, Kitchen King)
- Shopping cart functionality
- Responsive design with black/gold theme
- Contact form
- Order management
- Session-based cart storage

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes