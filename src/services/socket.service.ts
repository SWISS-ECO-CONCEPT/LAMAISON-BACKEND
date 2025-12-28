import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const setupSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] New connection: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
    });

    socket.on('error', (error: unknown) => {
      console.error(`[Socket.io] Error on socket ${socket.id}:`, error);
    });
  });

  return io;
};

export const notifyRdvUpdate = (io: SocketIOServer, prospectClerkId: string, data: Record<string, unknown>) => {
  // Broadcast to all connected clients about RDV update
  io.emit('rdv_update', { prospectClerkId, ...data });
  console.log(`[Socket.io] RDV update broadcasted for prospect: ${prospectClerkId}`);
};
