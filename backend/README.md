# WhatsApp SaaS Backend

A comprehensive WhatsApp Business API SaaS platform with AI-powered auto-replies, rule-based messaging, usage tracking, and analytics.

## Features

- 🔐 **User Authentication** - JWT-based authentication system
- 🏢 **Business Management** - Create and manage businesses with different plans
- 💬 **WhatsApp Integration** - Send and receive WhatsApp messages via Meta Cloud API
- 🤖 **AI Auto-Replies** - OpenAI or Ollama-powered intelligent responses
- 📋 **Rule-Based Replies** - Keyword-based automatic responses
- 📊 **Analytics** - Track messages, conversations, and usage statistics
- 📈 **Usage Tracking** - Monitor monthly message and AI reply limits
- 🎯 **Plan Management** - Free and Pro plans with different limits
- ⚡ **Queue System** - BullMQ-based job queue for message processing
- 🔄 **Webhook Support** - Receive real-time WhatsApp messages via webhooks

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Redis** - Queue and caching (via BullMQ)
- **JWT** - Authentication
- **BullMQ** - Job queue management
- **OpenAI/Ollama** - AI reply generation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- (Optional) Ollama for local AI processing

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the backend directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/wa_saas_dev

   # Redis
   REDIS_URL=redis://127.0.0.1:6379

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # WhatsApp Cloud API (Meta)
   WHATSAPP_TOKEN=your_whatsapp_cloud_api_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

   # AI Service Configuration
   # Option 1: Use OpenAI (requires API key)
   OPENAI_API_KEY=your_openai_api_key

   # Option 2: Use Local Ollama (free, unlimited)
   USE_OLLAMA=false
   OLLAMA_MODEL=codellama
   ```

4. **Start MongoDB and Redis**
   ```bash
   # Using Docker Compose
   docker-compose up -d mongo redis

   # Or start them manually
   # MongoDB: mongod
   # Redis: redis-server
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Start the message worker** (in a separate terminal)
   ```bash
   npm run worker
   ```

7. **Start the AI worker** (optional, in another terminal)
   ```bash
   npm run worker:ai
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | No (default: 7d) |
| `WHATSAPP_TOKEN` | Meta WhatsApp Cloud API token | Optional |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID | Optional |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification token | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `USE_OLLAMA` | Use local Ollama instead of OpenAI | No (default: false) |
| `OLLAMA_MODEL` | Ollama model name | No (default: codellama) |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Business
- `POST /api/business` - Create a business (protected)
- `GET /api/business` - Get my business (protected)
- `GET /api/business/settings` - Get business settings (protected)
- `PUT /api/business/settings` - Update business settings (protected)
- `POST /api/business/rules` - Add a rule (protected)
- `GET /api/business/rules` - Get all rules (protected)
- `PUT /api/business/rules/:ruleId` - Update a rule (protected)
- `DELETE /api/business/rules/:ruleId` - Delete a rule (protected)
- `GET /api/business/analytics` - Get analytics (protected)
- `GET /api/business/usage` - Get usage statistics (protected)
- `POST /api/business/plan/upgrade` - Upgrade/downgrade plan (protected)
- `GET /api/business/plan` - Get plan details (protected)
- `PUT /api/business/whatsapp/phone-number` - Update WhatsApp phone number ID (protected)

### Conversations
- `GET /api/conversations` - Get all conversations with message counts (protected)
- `GET /api/conversations/:conversationId` - Get conversation with messages (protected)
- `GET /api/conversations/:conversationId/messages` - Get messages only (protected)
- `POST /api/conversations/send` - Send an outbound message (protected)
- `POST /api/conversations/test/inbound` - Simulate inbound message (protected)

### WhatsApp
- `POST /api/whatsapp/test-inbound` - Test inbound message simulator (protected)
- `GET /api/whatsapp/webhook` - Webhook verification (Meta)
- `POST /api/whatsapp/webhook` - Receive webhook from Meta

### AI
- `POST /api/ai/reply` - Generate AI reply (protected)

### Messages
- `POST /api/messages/send` - Send message (protected)

## Usage

### 1. Register and Create Business

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Create Business
curl -X POST http://localhost:5000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Business"}'
```

### 2. Configure WhatsApp (Optional)

If you have Meta WhatsApp Cloud API credentials:
1. Set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `.env`
2. Configure webhook URL in Meta Developer Console: `https://your-domain.com/api/whatsapp/webhook`
3. Set `WHATSAPP_VERIFY_TOKEN` for webhook verification
4. Update your business WhatsApp phone number:
   ```bash
   curl -X PUT http://localhost:5000/api/business/whatsapp/phone-number \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"whatsappPhoneNumberId":"YOUR_PHONE_NUMBER_ID"}'
   ```

**Webhook Features:**
- Automatically receives inbound messages from customers
- Tracks message delivery status (sent, delivered, failed)
- Updates message status in real-time

### 3. Test Inbound Messages

```bash
# Simulate inbound message
curl -X POST http://localhost:5000/api/whatsapp/test-inbound \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"from":"1234567890","text":"Hello!"}'
```

### 4. Add Rules

```bash
curl -X POST http://localhost:5000/api/business/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"keyword":"hello","reply":"Hi! How can I help you?","enabled":true}'
```

## Plan Limits

| Plan | Messages/Month | AI Replies/Month |
|------|----------------|------------------|
| Free | 500 | 100 |
| Pro  | 10,000 | 5,000 |

### Upgrade Plan

```bash
curl -X POST http://localhost:5000/api/business/plan/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"plan":"pro"}'
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, OpenAI configs
│   ├── controllers/     # Route controllers
│   ├── handlers/        # Event handlers
│   ├── middleware/      # Auth and error middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── workers/         # BullMQ workers
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json
└── .env.example
```

## Development

### Running in Development Mode

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start worker
npm run worker
```

### Docker Setup

```bash
# Start all services (MongoDB, Redis, App)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Testing

Currently, the project uses manual testing via API endpoints. Test endpoints are available for simulating inbound messages.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure proper MongoDB and Redis instances
4. Set up proper error monitoring
5. Use process manager (PM2, etc.) for running server and workers
6. Set up reverse proxy (Nginx) if needed

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
