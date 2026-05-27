require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const listenWithFallbackPort = (startPort, maxAttempts = 10) => {
  let currentPort = Number(startPort);
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const tryListen = () => {
      const server = app.listen(currentPort, () => {
        resolve({ server, port: currentPort });
      });

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
          attempts += 1;
          currentPort += 1;
          console.warn(`Port ${currentPort - 1} is in use. Retrying on port ${currentPort}...`);
          return tryListen();
        }

        reject(err);
      });
    };

    tryListen();
  });
};

const startServer = async () => {
  try {
    await connectDB();

    const { server, port } = await listenWithFallbackPort(PORT, 20);
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port http://localhost:${port}`
    );

    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down gracefully...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server...`);
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
