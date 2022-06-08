import express, { Application, Request, Response } from "express";

import GetAllSocketClients from "@nirvana/core/sockets/getAllActiveSocketClients";
import InitializeWs from "./sockets";
import { NextFunction } from "express";
import NirvanaResponse from "@nirvana/core/responses/nirvanaResponse";
import ReceiveSignal from "../core/sockets/receiveSignal";
import SendSignal from "@nirvana/core/sockets/sendSignal";
import SocketChannels from "@nirvana/core/sockets/channels";
import { UserService } from "./services/user.service";
import { UserStatus } from "@nirvana/core/models";
import cors from "cors";
import getLineRoutes from "./routes/line";
import getSearchRoutes from "./routes/search";
import getUserRoutes from "./routes/user";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Time: ", new Date());
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("hello world.");
});

app.use("/api/status", (req: Request, res: Response) => {
  res.json(new NirvanaResponse("wohoo, server is healthy"));
});

app.use("/api/user", getUserRoutes());
app.use("/api/search", getSearchRoutes());
app.use("/api/lines", getLineRoutes());

const PORT = 5000;
const server = app.listen(PORT, () => console.log("express running"));

const io = require("socket.io")(server, {
  // todo: add authentication
  cors: {
    origin: "*",
  },
});

InitializeWs(io);
