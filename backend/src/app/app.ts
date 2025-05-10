import express, { Router } from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import { routes } from '../routes/routes';

dotenv.config();
const app = express();

const allowedOrigins = ['http://localhost:4200'];

app.use(
   cors({
      origin: (
         origin: string | undefined,
         callback: (error: Error | null, allowed?: boolean) => void
      ) => {
         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
         } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS.'), false);
         }
      },
      exposedHeaders: [],
      credentials: true,
   })
);

app.use(express.json());
app.use(
   express.urlencoded({
      extended: true,
   })
);
app.use(
   session({
      secret: process.env.SESSION_SECRET || '',
      resave: false,
      saveUninitialized: false,
      cookie: {
         secure: process.env.NODE_ENV === 'production',
         httpOnly: true,
         maxAge: 3600000,
      },
   })
);

app.use('/', routes(Router()));

export default app;
module.exports = app;
