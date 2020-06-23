const http = require("http");
const { disconnect } = require("process");
const WebSocketServer = require("websocket").server;

const httpServer = http.createServer(() => {});

httpServer.listen(1337, () => {
  console.log("Server is running on http://localhost:1337");
});

const wsServer = new WebSocketServer({
  httpServer,
});

const peersByChatid = [];

wsServer.on("request", (request) => {
  const connection = request.accept();
  const id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  connection.on("message", (message) => {
    const { code } = JSON.parse(message.utf8Data);

    if (!peersByChatid[code]) {
      peersByChatid[code] = [{ connection, id }];
    } else if (!peersByChatid[code].find((peer) => peer.id === id)) {
      peersByChatid[code].push({ connection, id });
    }

    const peer = peersByChatid[code].find((peer) => peer.id !== id);
    console.log("New message: ", message.utf8Data);
    if (peer) {
      peer.connection.send(message.utf8Data);
    }
  });
});

wsServer.on("connect", (conn) => {
  console.log(peersByChatid);
});

wsServer.on("close", (disconnected) => {
  const toArray = Object.entries(peersByChatid);
  console.log(toArray.length);
  const newPeers = [];
  toArray.map((conn, chatId) => {
    const filteredPeers = conn.filter((inner) => {
      return inner.connection !== disconnected;
    });

    newPeers[chatId] = filteredPeers;
  });
//   console.log(conn);
});
