import jwt from 'jsonwebtoken';

export const jwtTokenGenerator = (
   payload: object | string,
   secret: string,
   expires: string
) => {
   return jwt.sign(payload, secret, { expiresIn: expires });
};
