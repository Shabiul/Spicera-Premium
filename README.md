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
3. Set up your database (if using PostgreSQL):
   ```bash
   npm run db:push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with:

```
DATABASE_URL=your_database_url_here
SESSION_SECRET=your_session_secret_here
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