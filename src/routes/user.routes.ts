import { Router, Request, Response } from 'express';
import User from '../models/user.model';
import { checkIsValidUserBody, sanitizationUserBody, userValidationSchema } from '../utils/users.validation';
import { getErrorObject } from '../utils/error';
import { hashPassword } from '../utils/securityData';
import authenticateToken from '../middlewares/authenticator';

const router: Router = Router();

router.get('/users', authenticateToken, async (_: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 });
    return res.status(200).json(users);
  } catch (err) {
    const error = getErrorObject(err);
    return res.status(error.status).json(error);
  }
});

router.get('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  const id = req.params.id;

  if (id !== req.user?.id)
    return res.status(403).json({ message: 'You do not have permission to access this information.' });


  try {
    const user = await User.findById(id, { password: 0 });
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    else
      return res.status(200).json(user);
  } catch (err) {
    const error = getErrorObject(err);
    return res.status(error.status).json(error);
  }
});

router.post('/users', sanitizationUserBody, userValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidUserBody(req);

  if(isError) return res.status(422).json({ message })

  const { name, username, email, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const newUser = await user.save();
    return res.status(201).json({ message: `Created '${newUser.username}' with success`});
  } catch (err) {
    if(err.message.includes('duplicate key'))
      return res.status(409).json({ message: `Exist user with: ${err.keyValue.email || err.keyValue.username}`})
    else {
      const error = getErrorObject(err);
      return res.status(error.status).json(error);
    }
  }
});

router.put('/users/:id', authenticateToken, sanitizationUserBody, userValidationSchema, async (req: Request, res: Response) => {
  const id = req.params.id;

  if (id !== req.user?.id) {
    return res.status(403).json({ message: 'You do not have permission to modify this information.' });
  }

  const { isError, message } = checkIsValidUserBody(req);

  if(isError) return res.status(422).json({ message })

  const { name, username, email, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const user = await User.findByIdAndUpdate(id, { name, username, email, hashedPassword }, { new: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } else
      return res.json({ message: `Updated '${user.username}' with success`});
  } catch (err) {
    if(err.message.includes('duplicate key'))
      return res.status(409).json({ message: `Exist user with: ${err.keyValue.email || err.keyValue.username}`})
    else {
      const error = getErrorObject(err);
      return res.status(error.status).json(error);
    }
  }
});

router.delete('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (id !== req.user?.id) {
    return res.status(403).json({ message: 'You do not have permission to delete this information.' });
  }
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } else
      return res.status(200).json({ message: `Delete user '${user.username}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    return res.status(error.status).json(error);
  }
});

export default router;
