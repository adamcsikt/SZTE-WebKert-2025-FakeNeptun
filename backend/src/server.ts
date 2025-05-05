import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';

dotenv.config();
const app = express();

const allowedOrigins = ['http://localhost:4200'];

app.use(
   cors({
      origin: (
         origin: string | undefined,
         callback: (error: Error | null, allowed?: boolean) => void
      ) => {
         if (allowedOrigins.indexOf(origin!) === -1) {
            callback(new Error('Not allowed by CORS.'), false);
         }

         callback(null, true);
      },
      exposedHeaders: [],
      credentials: true,
   })
);

app.use(express.json());
