module.exports = {
    initializeSocket: (io) => {
      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
  
        socket.on('joinShow', (showId) => {
          socket.join(showId);
          console.log(`Client ${socket.id} joined show ${showId}`);
        });
  
        socket.on('leaveShow', (showId) => {
          socket.leave(showId);
          console.log(`Client ${socket.id} left show ${showId}`);
        });
  
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });
    },
  };