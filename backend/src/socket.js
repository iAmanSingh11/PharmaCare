const { Server } = require('socket.io');
const { verifyAccessToken } = require('./utils/tokens');

let io;

/*
 * Initializes Socket.IO on the given HTTP server.
 * Clients connect with their JWT access token: io(url, { auth: { token } })
 * Each authenticated socket joins a room named after their user ID, so
 * emitting to `user:<id>` reaches all of that user's open tabs/devices.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      // room membership is cleaned up automatically by socket.io
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.IO has not been initialized yet');
  return io;
};

/** Convenience helper: push a notification event to a specific user's room. */
const notifyUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIo, notifyUser };
