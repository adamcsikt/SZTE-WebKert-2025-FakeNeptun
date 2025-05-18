import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../models/user.model';
import fs from 'fs';
import path from 'path';
import { jwtTokenGenerator as jwtToken } from '../services/jwtTokenGenerator';

interface Feedback {
   _id: string;
   createdAt: string;
   userId?: string;
   username?: string;
   email?: string;
   feedbackType: 'bug' | 'suggestion' | 'compliment' | 'other';
   message: string;
   rating?: number;
   pageUrl?: string;
}

const usersFilePath = path.resolve(__dirname, '../mock-database/users.json');
const feedbacksFilePath = path.resolve(
   __dirname,
   '../mock-database/feedbacks.json'
);

const readUsers = (): User[] => {
   try {
      if (!fs.existsSync(usersFilePath)) {
         fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2), 'utf-8');
      }
      const data = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(data) as User[];
   } catch (error) {
      console.error('Error reading users file:', error);
      return [];
   }
};

const writeUsers = (users: User[]): void => {
   try {
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
   } catch (error) {
      console.error('Error writing users file:', error);
   }
};

const readFeedbacks = (): Feedback[] => {
   try {
      if (!fs.existsSync(feedbacksFilePath)) {
         const mockDbDir = path.dirname(feedbacksFilePath);
         if (!fs.existsSync(mockDbDir)) {
            fs.mkdirSync(mockDbDir, { recursive: true });
         }
         fs.writeFileSync(
            feedbacksFilePath,
            JSON.stringify([], null, 2),
            'utf-8'
         );
      }
      const data = fs.readFileSync(feedbacksFilePath, 'utf-8');
      return JSON.parse(data) as Feedback[];
   } catch (error) {
      console.error('Error reading feedbacks file:', error);
      return [];
   }
};

const writeFeedbacks = (feedbacks: Feedback[]): void => {
   try {
      fs.writeFileSync(
         feedbacksFilePath,
         JSON.stringify(feedbacks, null, 2),
         'utf-8'
      );
   } catch (error) {
      console.error('Error writing feedbacks file:', error);
   }
};

const authenticateToken = (req: Request, res: Response, next: Function) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (token == null) return res.sendStatus(401);

   try {
      console.log(
         'Token received, skipping full verification for mock setup for this route.'
      );
      next();
   } catch (err) {
      console.error('Token verification failed:', err);
      return res.sendStatus(403);
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
         const user = users.find((u) => u.username === username);
         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }
         if (!user.password) {
            console.error(`User ${username} has no password stored.`);
            return res.status(500).json({ message: 'Authentication error.' });
         }
         const isPasswordValid = await argon2.verify(user.password, password);
         if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
         }
         const { password: _, ...userToReturn } = user;
         return res.status(200).json({
            user: userToReturn,
            token: jwtToken(
               { userId: user._id, username: user.username },
               process.env.JWT_SECRET || 'DEFAULT_SECRET_KEY_REPLACE_IT',
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

   router.post(
      '/register',
      async (req: Request, res: Response): Promise<any> => {
         try {
            const {
               firstName,
               lastName,
               username,
               email,
               password,
               dateOfBirth,
               countryOfBirth,
               placeOfBirth,
               citizenship,
               gender,
               training,
               startDate,
            } = req.body;

            if (
               !username ||
               !password ||
               !firstName ||
               !lastName ||
               !email ||
               !dateOfBirth ||
               !countryOfBirth ||
               !placeOfBirth ||
               !citizenship ||
               !gender ||
               !training ||
               !startDate
            ) {
               return res.status(400).json({
                  message: 'Required fields are missing for registration.',
               });
            }
            const users: User[] = readUsers();
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
               _id: uuidv7(),
               username,
               password: hashedPassword,
               firstName,
               lastName,
               emails: [{ address: email, type: 'personal', isDefault: true }],
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
               nickname: `${firstName} ${lastName}`,
               training: training || 'N/A',
               startDate: startDate || new Date().toISOString().split('T')[0],
               dateOfBirth: dateOfBirth || '1900-01-01',
               countryOfBirth: countryOfBirth || 'N/A',
               countyOfBirth: req.body.countyOfBirth || undefined,
               placeOfBirth: placeOfBirth || 'N/A',
               citizenship: citizenship || 'N/A',
               gender: gender || 'Other',
               tajNumber: req.body.tajNumber || undefined,
               taxId: req.body.taxId || undefined,
               educationId: req.body.educationId || undefined,
               addresses: [],
               phoneNumbers: [],
               documents: [],
               bankAccounts: [],
               websites: [],
               theme: 'system',
               language: 'en',
            };
            users.push(newUser);
            writeUsers(users);
            const { password: _, ...userToReturn } = newUser;
            return res.status(201).json({
               user: userToReturn,
               token: jwtToken(
                  { userId: newUser._id, username: newUser.username },
                  process.env.JWT_SECRET || 'DEFAULT_SECRET_KEY_REPLACE_IT',
                  process.env.JWT_EXPIRES_IN || '1h'
               ),
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

   router.get('/users', authenticateToken, (req: Request, res: Response) => {
      const users = readUsers();
      const usersWithoutPasswords = users.map((user) => {
         const { password, ...rest } = user;
         return rest;
      });
      res.status(200).json(usersWithoutPasswords);
   });

   router.get(
      '/users/:id',
      authenticateToken,
      (req: Request, res: Response) => {
         const users = readUsers();
         const user = users.find((u) => u._id === req.params.id);
         if (user) {
            const { password, ...userToReturn } = user;
            res.status(200).json(userToReturn);
         } else {
            res.status(404).json({ message: 'User not found' });
         }
      }
   );

   router.put(
      '/users/:id',
      authenticateToken,
      async (req: Request, res: Response) => {
         const users = readUsers();
         const userIndex = users.findIndex((u) => u._id === req.params.id);
         if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
         }
         const originalUser = users[userIndex];
         const updatedUserData = req.body;
         const { _id, username, password, createdAt, ...updateableFields } =
            updatedUserData;
         const updatedUser: User = {
            ...originalUser,
            ...updateableFields,
            updatedAt: new Date().toISOString(),
         };
         users[userIndex] = updatedUser;
         writeUsers(users);
         const { password: _, ...userToReturn } = updatedUser;
         res.status(200).json({
            user: userToReturn,
            message: 'User updated successfully',
         });
      }
   );

   router.delete(
      '/users/:id',
      authenticateToken,
      (req: Request, res: Response) => {
         let users = readUsers();
         const initialLength = users.length;
         users = users.filter((u) => u._id !== req.params.id);
         if (users.length === initialLength) {
            return res.status(404).json({ message: 'User not found' });
         }
         writeUsers(users);
         res.status(200).json({ message: 'User deleted successfully' });
      }
   );

   router.post('/feedback', (req: Request, res: Response) => {
      try {
         const feedbackData = req.body as Omit<Feedback, '_id' | 'createdAt'>;

         if (!feedbackData.message || !feedbackData.feedbackType) {
            return res
               .status(400)
               .json({ message: 'Feedback type and message are required.' });
         }

         const feedbacks = readFeedbacks();
         const newFeedback: Feedback = {
            _id: uuidv7(),
            createdAt: new Date().toISOString(),
            ...feedbackData,
         };

         feedbacks.push(newFeedback);
         writeFeedbacks(feedbacks);

         res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: newFeedback,
         });
      } catch (error) {
         console.error('Error saving feedback:', error);
         res.status(500).json({ message: 'Failed to save feedback.' });
      }
   });

   return router;
};
