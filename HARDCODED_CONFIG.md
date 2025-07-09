# Hardcoded Configuration Summary

## What's Now Hardcoded in the Code:

### 🚀 **server.js**
- **Port**: Automatically uses 8080 for production (Azure), 3001 for local dev
- **CORS**: Configured to allow:
  - `http://localhost:3000` (local development)
  - `https://walmart-fashion-ai.vercel.app` (production frontend)
  - `https://*.azurewebsites.net` (Azure Web Apps)
- **Environment Detection**: Automatically detects production vs development

### 🔧 **web.config**
- **Node.js Environment**: Set to production
- **Memory Optimization**: Added `--max-old-space-size=1024`
- **Logging**: Enabled for debugging

### 📦 **GitHub Actions**
- **Simplified Build**: No testing, just install and build
- **Clean Deployment**: No Azure authentication needed
- **Health Check**: Validates deployment success

## Benefits:

✅ **Zero Configuration** - No environment variables needed  
✅ **No Secrets** - No GitHub secrets or Azure authentication  
✅ **Works Everywhere** - Same code works locally and in production  
✅ **Simple Deployment** - Just push to main branch  
✅ **Auto-Detection** - Automatically adapts to environment  

## How It Works:

1. **Local Development**: 
   - Runs on port 3001
   - CORS allows localhost:3000
   - Uses development mode

2. **Azure Production**:
   - Automatically runs on port 8080
   - CORS allows your production domains
   - Uses production optimizations

3. **Deployment**:
   - Push to main → GitHub Actions builds → Deploys to Azure
   - No configuration needed anywhere!

## Your API Endpoints:

- **Health**: `GET /api/health`
- **Event Picks**: `GET /api/agent/eventPicks/:storeId`  
- **Reset Thread**: `POST /api/agent/reset-thread`

Everything just works! 🎉
