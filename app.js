import express from "express";
import SocketIo from "socket.io";
import { createServer } from "http";
import fs from "fs";

const PORT = 4000;

const app = express();

app.use("/public", express.static(`${__dirname}/public`));
app.get("/", (_, res) => res.send("Server online"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = createServer(app);
const wsServer = SocketIo(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8, // 100mb
});

wsServer.on("connection", (socket) => {
  socket.on("uploadStart", (uploadInfo) => {
    if (!socket.uploadPath) {
      const { uploadId, extension } = uploadInfo;
      socket.uploadPath = `${__dirname}/public/uploads/${uploadId + extension}`;
    }
  });
  socket.on("upload", async (blob, nextIndex) => {
    if (blob.length == 0) return;

    await fs.appendFileSync(socket.uploadPath, blob);
    nextIndex();
  });
});

const handleListen = () => {
  console.log(`http server on http://localhost:${PORT}`);
};

httpServer.listen(PORT, handleListen);
