export const users = new Map();

const socketInit = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("New client connected", socket.id);

    users.set(socket.id, {});
    socket.on("register", (userId: string) => {
      users.set(socket.id, { userId });
      console.log("User registered with ID:", userId);
    });

    socket.on("disconnect", (reason: any) => {
      users.delete(socket.id);
      console.log("client disconnected", socket.id, reason);
    });
  });
};

export default socketInit;
