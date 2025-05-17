import jwt, { Secret } from 'jsonwebtoken';

export const jwtTokenGenerator = (
   payload: object | string,
   secret: Secret,
   expires?: string | number
): string => {
   return jwt.sign(payload, secret, { expiresIn: expires as any });
};
