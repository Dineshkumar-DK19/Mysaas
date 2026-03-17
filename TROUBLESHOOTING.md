# Troubleshooting Guide

## Business Creation Error

If you're getting "Failed to create business" error, check the following:

### 1. Check Backend Server
- Make sure backend is running on `http://localhost:5000`
- Check backend terminal for error messages
- Test backend health: Open `http://localhost:5000/api/health` in browser

### 2. Check Database Connection
- **MongoDB must be running**
  - Windows: Check if MongoDB service is running
  - Or start manually: `mongod`
  - Default connection: `mongodb://localhost:27017`

- **Redis must be running** (for message queue)
  - Windows: Check if Redis service is running
  - Or start manually: `redis-server`
  - Default connection: `redis://127.0.0.1:6379`

### 3. Check Environment Variables
Make sure `backend/.env` file exists with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/wa_saas_dev
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-secret-key-here
```

### 4. Check Browser Console
- Open browser DevTools (F12)
- Check Console tab for detailed error messages
- Check Network tab to see the API request/response

### 5. Common Issues

**Issue: "Network error"**
- Backend server is not running
- Backend is running on different port
- CORS issue (check backend logs)

**Issue: "User already has a business"**
- User already created a business
- Solution: Use the business that already exists

**Issue: "Invalid user ID"**
- Authentication token issue
- Solution: Log out and log back in

**Issue: "Validation Error"**
- Missing required fields
- Invalid data format
- Check error details in response

### 6. Debug Steps

1. **Check Backend Logs**
   - Look at the backend terminal output
   - Check for MongoDB connection errors
   - Check for Redis connection errors

2. **Test API Directly**
   ```bash
   # Get your token from browser localStorage
   # Then test in Postman or curl:
   curl -X POST http://localhost:5000/api/business \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"Test Business"}'
   ```

3. **Check Database**
   - Connect to MongoDB and check if collections exist
   - Check if user document exists

### 7. Quick Fixes

**Restart Everything:**
1. Stop backend server (Ctrl+C)
2. Stop frontend server (Ctrl+C)
3. Start MongoDB and Redis
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`

**Clear and Retry:**
1. Clear browser localStorage
2. Log out and log back in
3. Try creating business again

### 8. Still Having Issues?

Check the browser console for the exact error message. The error should now show more details about what went wrong.
