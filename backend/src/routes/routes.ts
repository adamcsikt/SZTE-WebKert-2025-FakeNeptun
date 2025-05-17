import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
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

   router.post('/login', async (req: Request, res: Response): Promise<any> => {
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

   // router.post('/logout', (req: Request, res: Response) => {});

   router.post(
      '/register',
      async (req: Request, res: Response): Promise<any> => {
         try {
            const {
               username,
               password,
               firstName,
               lastName,
               email /*, other fields */,
            } = req.body;
            if (!username || !password || !firstName || !lastName || !email) {
               return res
                  .status(400)
                  .json({ message: 'All fields are required' });
            }
            const users: User[] = readUsers(); // readUsers() needs to be accessible or reimplemented
            if (users.find((u) => u.username === username)) {
               return res
                  .status(409)
                  .json({ message: 'Username already exists' });
            }
            if (users.find((u) => u.emails.some((e) => e.address === email))) {
               return res.status(409).json({ message: 'Email already exists' });
            }

            const hashedPassword = await argon2.hash(password);
            const newUser: User = {
               _id: uuidv7(), // Make sure uuidv7 is imported: import { v7 as uuidv7 } from 'uuid';
               username,
               password: hashedPassword,
               firstName,
               lastName,
               emails: [{ address: email, type: 'primary', isDefault: true }],
               // Add other necessary fields from your User model with default/mock values
               createdAt: new Date().toISOString(),
               nickname: `${firstName} ${lastName}`,
               training: 'Mock Training',
               startDate: new Date().toISOString(),
               dateOfBirth: '1990-01-01', // Mock
               countryOfBirth: 'Hungary', // Mock
               countyOfBirth: 'Csongrád-Csanád', // Mock
               placeOfBirth: 'Szeged', // Mock
               citizenship: 'Hungarian', // Mock
               gender: 'Other', // Mock
               tajNumber: '000000000', // Mock
               taxId: '0000000000', // Mock
               educationId: '00000000000', // Mock
               addresses: [],
               phoneNumbers: [],
               documents: [],
            };

            users.push(newUser);
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2)); // usersFilePath needs to be accessible

            // Don't send password back
            const { password: _, ...userToReturn } = newUser;
            return res.status(201).json({
               user: userToReturn,
               message: 'User registered successfully',
            });
         } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
               message: 'An unexpected error occurred during registration',
            });
         }
      }
   );

   return router;
};
