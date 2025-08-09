# Technology Stack

## Frontend
- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite 6.x
- **Styling**: TailwindCSS 4.x
- **State Management**: Pinia
- **Router**: Vue Router 4
- **UI Components**: vue3-easy-data-table
- **Testing**: Vitest (unit), Playwright (e2e)

## Backend
- **Runtime**: Node.js with CommonJS modules
- **Framework**: Express.js (v4/v5)
- **Authentication**: Passport.js with JWT strategy
- **Database**: SQLite3 with Knex.js migrations
- **Development**: Nodemon for hot reload
- **Testing**: Jest

## Development Tools
- **Linting**: ESLint + Oxlint
- **Formatting**: Prettier
- **Package Manager**: npm
- **Environment**: Docker support via devcontainer

## Common Commands

### Initial Setup
```bash
# Initialize all services and databases
./init.sh

# Start development servers (web + app)
./run.sh
```

### Frontend (web/)
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:unit    # Run unit tests
npm run test:e2e     # Run e2e tests
npm run lint         # Lint and fix code
npm run format       # Format code
```

### Backend Services (app/, auth/, catalogos/)
```bash
npm run dev          # Start with nodemon
npm start            # Start production
npm test             # Run tests
```

### Database (database/)
```bash
npm run migrate-app  # Run app migrations
npm run migrate-auth # Run auth migrations  
npm run migrate-cat  # Run catalog migrations
```

## Environment Variables
All services require `.env` files with:
- `CORS_ORIGIN`: Frontend URL for CORS
- `JWT_SECREAT_KEY`: JWT signing secret
- `PORT`: Service port number