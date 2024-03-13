import { Router, Request, Response } from 'express';
import UserModel from '../models/user.model';
import { compareHash } from '../utils/securityData';
import { getErrorObject } from '../utils/error';

const router: Router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
  try {
    const user = await UserModel.findOne(
      { $or: [{ email }, { username }] }
    )

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const isMatch = await compareHash(password, user.password);
    if (isMatch) {
      return res.status(200).json({ message: 'Login bem sucedido' });
    } else {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

export default router;