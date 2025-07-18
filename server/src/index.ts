import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
dotenv.config();

const wss = new WebSocketServer({ port: Number(process.env.SERVER_PORT) || 8081 });
console.log("Server started on port " + (process.env.SERVER_PORT || 8081));

interface Users {
    socket: WebSocket;
    room: string;
}

let allSockets: Users[] = [];

wss.on("connection", (socket) => {

    socket.on("message", (message: string) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            console.log("Client joined room "+ parsedMessage.payload.roomId);
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }
        if (parsedMessage.type === "chat") {
            const userRoom = allSockets.find((x) => x.socket === socket)?.room;
            if (userRoom) {
                allSockets
                    .filter((x) => x.room === userRoom)
                    .forEach((user) => user.socket.send(parsedMessage.payload.message));
            }
        }
    });

    wss.on("close", () => {
        allSockets = allSockets.filter((s) => s.socket != socket);
        console.log("Client disconnected");
    });
});