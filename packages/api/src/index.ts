import './repository/db';

import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Application, NextFunction, Request, Response } from 'express';

import InitializeWs from './services/SocketService';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500);
  res.json(new NirvanaResponse(undefined, err, err.message));
});

app.get('/', (req: Request, res: Response) => {
  res.send('hello world.');
});
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ message: 'wohoo, server is healthy' });
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`express running on port | ${PORT} in host machine`),
);

const io = require('socket.io')(server, {
  // todo: add authentication
  cors: {
    origin: '*',
  },
});

InitializeWs(io);
