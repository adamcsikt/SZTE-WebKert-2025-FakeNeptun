import express, { Request, Response } from 'express';
import * as functions from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';

functions.setGlobalOptions({ region: 'europe-west1' });

try {
   admin.initializeApp();
} catch (e) {
   console.error('Firebase admin initialization error', e);
}

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

// const url = process.env.baseURL || 'http://localhost';
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//    console.log(`Server running on ${url}:${port}`);
// });

app.get('/', (req: Request, res: Response) => {
   res.send('CORS enabled Express server is running');
});

export const api = onRequest(app);
