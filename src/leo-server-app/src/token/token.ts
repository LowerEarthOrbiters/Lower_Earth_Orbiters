import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const key: string | undefined = process.env.KEY_TOKEN as string;

interface Payload {
  id: string;
}

const Token = ({ id }: Payload): string => jwt.sign(
  { id },
  key!,
  { expiresIn: '2h' },
);

export default Token;
