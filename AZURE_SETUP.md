# Azure Portal Configuration Guide

Since you're not using GitHub secrets for Azure authentication, you'll need to configure environment variables directly in the Azure Portal. This is actually simpler and more secure!

## Step 1: Configure Environment Variables in Azure Portal

1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service: `walmart-fashion-ai-api`
3. Go to **Settings** → **Environment variables**
4. Add these application settings:

### Required Environment Variables:

```
NODE_ENV = production
WEBSITE_NODE_DEFAULT_VERSION = ~22
PORT = 8080
SCM_DO_BUILD_DURING_DEPLOYMENT = false
WEBSITE_RUN_FROM_PACKAGE = 1
WEBSITE_STARTUP_FILE = server.js
```

### Azure Service Configuration (if needed by your app):
```
AZURE_CLIENT_ID = your_azure_client_id
AZURE_CLIENT_SECRET = your_azure_client_secret  
AZURE_TENANT_ID = your_azure_tenant_id
```

## Step 2: Deployment Process

Your GitHub Actions workflow will now:

1. ✅ **Build** your Node.js app
2. ✅ **Package** only production files
3. ✅ **Deploy** to Azure Web App (using publish profile)
4. ✅ **Health Check** to verify deployment

## Benefits of This Approach:

- 🔒 **More Secure**: No secrets stored in GitHub
- 🚀 **Simpler**: No authentication complexity in CI/CD
- 🔧 **Easier Management**: Change settings directly in Azure Portal
- 📊 **Better Monitoring**: Azure handles all the configuration

## How Deployment Works:

The `azure/webapps-deploy@v3` action uses the **publish profile** that Azure automatically configures for your App Service. This means:

- No manual secrets needed
- No Azure login required
- Deployment just works out of the box

## API Endpoints:

Your deployed app will be available at:
- **Base URL**: `https://walmart-fashion-ai-api-e8e0afc0bdbjhebh.eastus2-01.azurewebsites.net`
- **Health Check**: `GET /api/health`
- **Agent Event Picks**: `GET /api/agent/eventPicks/:storeId`
- **Reset Thread**: `POST /api/agent/reset-thread`

## Troubleshooting:

If deployment fails:
1. Check GitHub Actions logs
2. Verify environment variables in Azure Portal
3. Check App Service logs in Azure Portal → **Monitoring** → **Log stream**
