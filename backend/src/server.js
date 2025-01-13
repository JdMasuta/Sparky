// backend/src/server.js
import express from 'express';
import cors from 'cors';
import { serverConfig } from './services/config/server.config.js';
import cableDataRoutes from './services/routes/cableDataRoutes.js';
import errorHandler from './services/middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', cableDataRoutes);

app.use(errorHandler);

// Create HTTP server
const server = app.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
});