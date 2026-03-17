# WhatsApp SaaS Frontend

React + Vite frontend for the WhatsApp Business API SaaS platform.

## Features

- 🔐 **Authentication** - Login and registration
- 💬 **Conversations** - View and manage customer conversations
- 📊 **Analytics** - Business performance metrics
- ⚙️ **Settings** - Configure auto-replies, AI tone, and WhatsApp integration
- 📋 **Rules** - Create keyword-based auto-replies
- 💳 **Plan Management** - View and upgrade subscription plans
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Environment Setup

Make sure the backend is running on `http://localhost:5000`. The frontend is configured to proxy API requests to the backend.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/       # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Conversations.jsx
│   │   ├── ConversationDetail.jsx
│   │   ├── Settings.jsx
│   │   ├── Rules.jsx
│   │   ├── Analytics.jsx
│   │   └── Plan.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features Overview

### Authentication
- User registration and login
- JWT token management
- Protected routes

### Dashboard
- Overview statistics
- Usage metrics
- Quick actions

### Conversations
- List all conversations
- View conversation details
- Send messages
- Real-time message updates

### Settings
- Auto-reply configuration
- AI tone selection
- Business hours
- WhatsApp phone number setup

### Rules
- Create keyword-based rules
- Enable/disable rules
- Edit and delete rules

### Analytics
- Message statistics
- Usage tracking
- Plan information

### Plan Management
- View current plan
- Upgrade to Pro
- Downgrade to Free

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment

1. Build the project: `npm run build`
2. Serve the `dist` directory using a static file server
3. Configure your server to proxy `/api` requests to your backend

## API Integration

The frontend communicates with the backend API through the `api.js` service. All API requests are automatically authenticated using the JWT token stored in localStorage.

## License

ISC
