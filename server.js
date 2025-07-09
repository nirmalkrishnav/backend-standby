import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import runEventPickAgentConversation, { resetThread } from './services/eventPickAgent.js';

// Load environment variables (fallback for local development)
dotenv.config();

const app = express();
// Hardcoded port for Azure Web App (Azure uses 8080, local development uses 3001)
const PORT = 8080;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration - hardcoded for production
app.use(cors({
    origin: [
        'http://localhost:3000',  // Local development
        'https://*.azurewebsites.net'  // Azure Web Apps
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Performance middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'walmart-fashion-backend'
    });
});

// VisPick Agent conversation endpoint
app.get('/api/agent/EventPick/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Store ID is required'
            });
        }

        const result = await runEventPickAgentConversation(storeId);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({
                success: false,
                error: 'EventPick Agent conversation failed',
                message: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error running EventPick agent conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to run EventPick agent conversation',
            details: error.message
        });
    }
});

// Reset thread endpoint
app.post('/api/EventPick/reset-thread', async (req, res) => {
    try {
        const newThreadId = await resetThread();
        res.json({
            success: true,
            message: 'Thread reset successfully',
            newThreadId: newThreadId
        });
    } catch (error) {
        console.error('Error resetting thread:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to reset thread',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

export default app;
