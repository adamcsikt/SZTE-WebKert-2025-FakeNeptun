import { Router, Request, Response } from 'express';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { User } from '../models/user.model'; // Ensure this path is correct
import fs from 'fs';
import path from 'path';
import { jwtTokenGenerator as jwtToken } from '../services/jwtTokenGenerator';

const usersFilePath = path.resolve(__dirname, '../mock-database/users.json');

const readUsers = (): User[] => {
   try {
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

// Middleware to check for JWT (very basic, for demonstration)
// In a real app, use a library like express-jwt or passport-jwt
const authenticateToken = (req: Request, res: Response, next: Function) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

   if (token == null) return res.sendStatus(401); // if there isn't any token

   // jwt.verify is synchronous here if the secret is a string and no callback is provided
   // For async verification (e.g. with a public key or callback), handle appropriately
   try {
      // Assuming jwtTokenGenerator uses 'jsonwebtoken' library's sign method
      // and your jwtToken service doesn't have a verify method exposed.
      // You'd typically use jwt.verify from 'jsonwebtoken' directly here.
      // For simplicity, this example won't fully implement JWT verification
      // but highlights where it should go.
      // const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
      // (req as any).user = decoded; // Add user payload to request
      // For now, let's assume the token is valid if present
      console.log('Token received, skipping full verification for mock setup.');
      next();
   } catch (err) {
      console.error('Token verification failed:', err);
      return res.sendStatus(403); // if token is not valid
   }
};

export const routes = (router: Router): Router => {
   router.get('/', (req: Request, res: Response) => {
      res.send('CORS enabled Express server is running!');
      res.status(200).end();
   });

   router.post('/login', async (req: Request, res: Response): Promise<any> => {
      // ... (Login logic remains the same)
      try {
         const { username, password } = req.body;
         const users: User[] = readUsers();

         const user = users.find((user) => user.username === username);
         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }
         if (!user.password) {
            // Should not happen if users always have passwords
            console.error(`User ${username} has no password stored.`);
            return res.status(500).json({ message: 'Authentication error.' });
         }

         const isPasswordValid = await argon2.verify(user.password, password);
         if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
         }

         const { password: _, ...userToReturn } = user; // Exclude password from response

         return res.status(200).json({
            user: userToReturn,
            token: jwtToken(
               { userId: user._id, username: user.username },
               process.env.JWT_SECRET || 'DEFAULT_SECRET_KEY_REPLACE_IT', // Ensure you have a secret
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
               // Include other fields from your User model as needed
               dateOfBirth, // expecting YYYY-MM-DD string
               countryOfBirth,
               placeOfBirth,
               citizenship,
               gender,
               training,
               startDate, // expecting YYYY-MM-DD string
               // tajNumber, taxId, educationId etc. could be optional
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
               addresses: [], // Initialize with empty or example data
               phoneNumbers: [],
               documents: [],
               bankAccounts: [],
               websites: [],
               theme: 'system',
               language: 'en',
            };

            users.push(newUser);
            writeUsers(users);

            const { password: _, ...userToReturn } = newUser; // Exclude password
            return res.status(201).json({
               user: userToReturn,
               token: jwtToken(
                  // Also issue a token on registration
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

   // GET all users (Read) - Add authenticateToken if needed
   router.get('/users', authenticateToken, (req: Request, res: Response) => {
      const users = readUsers();
      // Exclude passwords from the list
      const usersWithoutPasswords = users.map((user) => {
         const { password, ...rest } = user;
         return rest;
      });
      res.status(200).json(usersWithoutPasswords);
   });

   // GET a single user by ID (Read) - Add authenticateToken if needed
   router.get(
      '/users/:id',
      authenticateToken,
      (req: Request, res: Response) => {
         const users = readUsers();
         const user = users.find((u) => u._id === req.params.id);
         if (user) {
            const { password, ...userToReturn } = user; // Exclude password
            res.status(200).json(userToReturn);
         } else {
            res.status(404).json({ message: 'User not found' });
         }
      }
   );

   // PUT update a user by ID (Update) - Add authenticateToken if needed
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

         // Prevent changing _id, username, password (password change should be a separate endpoint)
         const { _id, username, password, createdAt, ...updateableFields } =
            updatedUserData;

         // Merge existing user with new data, keeping critical fields immutable
         const updatedUser: User = {
            ...originalUser, // Keep original critical fields
            ...updateableFields, // Apply updates for allowed fields
            updatedAt: new Date().toISOString(), // Update timestamp
         };

         // Special handling if a new password is provided and password change is allowed on this endpoint
         // For now, we assume password is not changed here to keep it simple.
         // If password change is needed:
         // if (updatedUserData.newPassword) {
         //    updatedUser.password = await argon2.hash(updatedUserData.newPassword);
         // }

         users[userIndex] = updatedUser;
         writeUsers(users);

         const { password: _, ...userToReturn } = updatedUser; // Exclude password
         res.status(200).json({
            user: userToReturn,
            message: 'User updated successfully',
         });
      }
   );

   // DELETE a user by ID (Delete) - Add authenticateToken if needed
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

   // router.post('/logout', (req: Request, res: Response) => {}); // Placeholder for logout

   return router;
};
