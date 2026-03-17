# Starting the WhatsApp SaaS Application

## Quick Start

### Option 1: Using PowerShell (Windows)

Open PowerShell and run:

```powershell
# Terminal 1: Backend Server
cd e:\saas\mysaas\backend
npm run dev

# Terminal 2: Frontend Server
cd e:\saas\mysaas\frontend
npm run dev

# Terminal 3: Message Worker (Optional but recommended)
cd e:\saas\mysaas\backend
npm run worker
```

### Option 2: Using the provided scripts

The servers have been started automatically in separate windows.

## Prerequisites

Before starting, make sure:

1. **MongoDB is running**
   - Default: `mongodb://localhost:27017`
   - Or update `MONGO_URI` in `.env`

2. **Redis is running**
   - Default: `redis://127.0.0.1:6379`
   - Or update `REDIS_URL` in `.env`

3. **Backend .env file exists**
   - Copy `.env.example` to `.env` (if exists)
   - Or create `.env` with required variables:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/wa_saas_dev
     REDIS_URL=redis://127.0.0.1:6379
     JWT_SECRET=your-secret-key-here
     ```

## Server URLs

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **API Health Check**: http://localhost:5000/api/health

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Check if Redis is running
- Verify `.env` file exists with correct values
- Check if port 5000 is available

### Frontend won't start
- Check if port 3000 is available
- Verify backend is running on port 5000
- Check browser console for errors

### Messages not processing
- Make sure the message worker is running: `npm run worker` in backend directory

## Next Steps

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Create your business
4. Start using the platform!
