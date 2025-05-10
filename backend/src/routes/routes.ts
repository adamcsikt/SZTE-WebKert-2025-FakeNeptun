import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { User } from '../models/user.model';
import fs from 'fs';
import path from 'path';
import { jwtTokenGenerator as jwtToken } from '../services/jwtTokenGenerator';

const usersFilePath = path.resolve(__dirname, '../mock-database/users.json');

const readUsers = (): User[] => {
   try {
      const data = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(data);
   } catch (error) {
      console.error('Error reading users file:', error);
      return [];
   }
};

export const routes = (router: Router): Router => {
   router.get('/', (req: Request, res: Response) => {
      res.send('CORS enabled Express server is running!');
      res.status(200).end();
   });

   router.post('/login', async (req: Request, res: Response) => {
      try {
         const { username, password } = req.body;
         const users: User[] = readUsers();

         const user = users.find((user) => user.username === username);
         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }

         const isPasswordValid = await argon2.verify(user.password, password);
         if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
         }

         return res.status(200).json({
            user: { ...user, password: undefined },
            token: jwtToken(
               { userId: user._id, username: user.username },
               process.env.JWT_SECRET || '',
               process.env.JWT_EXPIRES_IN || '1h'
            ),
            message: 'Login successful',
         });
      } catch (error) {
         console.error('Login error:', error);
         return res
            .status(500)
            .json({ message: 'An unexpected error occurred during login' });
      }
   });

   router.post('/logout', (req: Request, res: Response) => {});
   router.post('/register', (req: Request, res: Response) => {});

   return router;
};
