import express from 'express';
import { errorHandler } from './interfaces/middlewares/error-handling';
import { env } from './env';
import { WebSocketClientService } from './application/services/WebSocketClientService';
const app = express();
const webSocketClient = new WebSocketClientService(
env.EVOLUTION_URL_WITH_INSTANCE,
env.APIKEY,
env.INSTANCE,
);

webSocketClient.initialize();
app.use(express.json());
app.use(errorHandler);

export {app}