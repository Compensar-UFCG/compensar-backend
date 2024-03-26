import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Authentication token not provided.' });


  jwt.verify(token, process?.env?.PRIVATE_KEY || "", (err, user) => {
    if (err) {
      return res.status(498).json({ message: 'Invalid token.' });
    } else {
      req.user = user as User;
      next();
    }
  });
};

export default authenticateToken;