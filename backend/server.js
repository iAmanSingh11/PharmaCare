require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`PharmaCare API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled promise rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
