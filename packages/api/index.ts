import express, { Application, NextFunction, Request, Response } from 'express';

import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Time: ', new Date());
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('hello world.');
});

app.use('/api/status', (req: Request, res: Response) => {
  res.json({ message: 'wohoo, server is healthy' });
});

const PORT = 5000;
const server = app.listen(PORT, () => console.log('express running'));
