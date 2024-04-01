import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-access-token'] as string | undefined;

  if (token) {
    jwt.verify(token, process.env.KEY as string, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Authorization failed',
        });
      } else {
        (req as any).decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({
      message: 'Authorization failed',
    });
    return;
  }
};

export default verifyToken;
