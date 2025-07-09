# Walmart Fashion Backend

This is the backend API server for the Walmart Fashion AI application, built with Node.js and Express.js.

## Features

- RESTful API endpoints
- Azure AI Projects integration
- Security middleware (Helmet, CORS)
- Performance optimization (compression)
- Health check endpoint
- Error handling middleware

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Azure credentials configured

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Returns server health status

### Agent Endpoints
- `GET /api/agent/eventPicks/:storeId` - Get event picks for a store
- `POST /api/agent/reset-thread` - Reset the conversation thread

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `AZURE_CLIENT_ID` - Azure client ID
- `AZURE_CLIENT_SECRET` - Azure client secret  
- `AZURE_TENANT_ID` - Azure tenant ID

## Project Structure

```
backend/
├── server.js              # Main server file
├── services/
│   └── agent.js           # Azure AI agent service
├── package.json
├── .env.example
└── README.md
```

## Security

The application includes several security measures:
- Helmet.js for security headers
- CORS configuration
- Input validation
- Error handling middleware

## Development

The server uses nodemon for automatic restarts during development. Make sure to install dependencies and configure environment variables before starting development.
