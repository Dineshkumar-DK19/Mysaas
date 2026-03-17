// PM2 ecosystem file for production deployment
module.exports = {
  apps: [
    {
      name: 'whatsapp-saas-api',
      script: './server.js',
      instances: process.env.PM2_INSTANCES || 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'whatsapp-saas-worker',
      script: './src/workers/messageWorker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-worker-error.log',
      out_file: './logs/pm2-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '512M',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
