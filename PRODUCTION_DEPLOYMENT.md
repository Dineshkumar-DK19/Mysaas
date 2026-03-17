# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB 6+ running
- Redis 6+ running
- PM2 installed globally (`npm install -g pm2`)
- Domain name with SSL certificate (for production)
- Nginx (optional, for reverse proxy)

## Backend Deployment

### 1. Environment Setup

Create `.env` file in `backend/` directory:

```env
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb://your-mongo-host:27017/wa_saas_prod

# Redis
REDIS_URL=redis://your-redis-host:6379

# JWT
JWT_SECRET=your-very-strong-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# WhatsApp (if using)
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# AI
OPENAI_API_KEY=your_key
USE_OLLAMA=false

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

### 2. Install Dependencies

```bash
cd backend
npm ci --production
```

### 3. Start with PM2

```bash
# Start all processes (API + Worker)
pm2 start ecosystem.config.js

# Or start individually
pm2 start server.js --name whatsapp-saas-api
pm2 start src/workers/messageWorker.js --name whatsapp-saas-worker

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 4. PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Monitor
pm2 monit
```

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend
npm ci
npm run build
```

### 2. Deploy Options

#### Option A: Static Hosting (Vercel, Netlify, etc.)

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://api.yourdomain.com`

#### Option B: Nginx + Node.js Server

1. Copy `dist` folder to server
2. Configure Nginx (see `nginx.conf`)
3. Update `VITE_API_URL` in build

#### Option C: Serve with Express

Add to backend `app.js`:

```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters, random)
- [ ] HTTPS enabled
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] Input sanitization enabled
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] API keys stored securely
- [ ] Error messages don't expose sensitive info
- [ ] Logs don't contain sensitive data

## Performance Optimizations

- [ ] Compression enabled
- [ ] Database connection pooling configured
- [ ] Redis connection pooling configured
- [ ] PM2 cluster mode enabled
- [ ] Frontend code minified and chunked
- [ ] Static assets cached
- [ ] CDN for static assets (optional)

## Monitoring

### Health Checks

- Backend: `https://api.yourdomain.com/api/health`
- Readiness: `https://api.yourdomain.com/api/ready`

### Logs

- Application logs: `backend/logs/`
- PM2 logs: `pm2 logs`
- System logs: Check your hosting provider

### Metrics to Monitor

- API response times
- Error rates
- Database connection status
- Redis connection status
- Memory usage
- CPU usage
- Queue length (BullMQ)

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx, AWS ALB, etc.)
2. Run multiple PM2 instances
3. Use MongoDB replica set
4. Use Redis cluster

### Vertical Scaling

1. Increase PM2 instances: `PM2_INSTANCES=4`
2. Increase database connection pool
3. Increase Redis connection pool

## Backup Strategy

1. **Database**: Regular MongoDB backups
2. **Redis**: Persistence enabled
3. **Logs**: Rotate and archive
4. **Environment**: Version control `.env.example`

## Rollback Procedure

1. Stop PM2 processes: `pm2 stop all`
2. Restore previous code version
3. Restore database backup if needed
4. Restart: `pm2 start all`

## Troubleshooting

### Check Logs
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Check Health
```bash
curl https://api.yourdomain.com/api/health
curl https://api.yourdomain.com/api/ready
```

### Restart Services
```bash
pm2 restart all
```

## Support

For production issues, check:
1. Application logs
2. PM2 logs
3. System logs
4. Database logs
5. Redis logs
