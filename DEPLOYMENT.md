# Azure Deployment Configuration

## Required GitHub Secrets

To deploy this application to Azure Web App, you need to configure the following secrets in your GitHub repository:

### Azure Service Principal Secrets (for GitHub Actions)
- `AZUREAPPSERVICE_CLIENTID_577EC189E29F42DEB055581C0B122C60`: Azure Client ID for authentication
- `AZUREAPPSERVICE_TENANTID_35C1F98AD7D644B6A9BE2D30FA073439`: Azure Tenant ID
- `AZUREAPPSERVICE_SUBSCRIPTIONID_8090579BEF7242FCBF8779911622D334`: Azure Subscription ID

### Azure Application Secrets (for runtime)
- `AZURE_CLIENT_ID`: Azure Client ID for the application
- `AZURE_CLIENT_SECRET`: Azure Client Secret for the application  
- `AZURE_TENANT_ID`: Azure Tenant ID for the application

## Deployment Features

The GitHub Actions workflow includes:

1. **Optimized Build Process**
   - Uses `npm ci` for faster, reliable installs
   - Caches Node.js dependencies
   - Creates production-only package

2. **Secure Configuration**
   - Managed Identity support for Azure services
   - Environment variables properly configured
   - Secrets management through GitHub Secrets

3. **Health Monitoring**
   - Automated health checks after deployment
   - Retry logic for deployment validation
   - JSON response parsing for detailed status

4. **Azure App Service Optimization**
   - Proper `web.config` for IIS/Node.js integration
   - Production environment configuration
   - Deployment settings optimization

## Environment Configuration

The application automatically configures:
- `NODE_ENV=production`
- `PORT=8080` (Azure App Service standard)
- `WEBSITE_STARTUP_FILE=server.js` (tells Azure how to start the app)
- `WEBSITE_RUN_FROM_PACKAGE=1` (runs from deployment package)
- Azure credentials from secrets
- Proper Node.js version (22.x)

## API Endpoints

- Health Check: `GET /api/health`
- Agent Event Picks: `GET /api/agent/eventPicks/:storeId`
- Reset Thread: `POST /api/agent/reset-thread`

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs for build errors
2. Verify all required secrets are configured
3. Check Azure App Service logs in the Azure portal
4. Ensure the health check endpoint is responding
