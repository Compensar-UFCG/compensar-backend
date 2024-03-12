import { Router, Request, Response } from 'express';
import User from '../models/user.model';
import { checkIsValidUserBody, sanitizationUserBody, userValidationSchema } from '../utils/users.validation';
import { getErrorObject } from '../utils/error';

const router: Router = Router();

router.get('/users', async (_: Request, res: Response) => {
  try {
    const users = await User.find();
    const usersNoSensitiveInformation = users.map(user => { return { name: user.name, email: user.email }})
    res.status(200).json(usersNoSensitiveInformation);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.get('/users/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.post('/users', sanitizationUserBody, userValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidUserBody(req);

  if(isError) return res.status(422).json({ message })

  const user = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({ message: `Created '${newUser.username}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.put('/users/:id', sanitizationUserBody, userValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidUserBody(req);

  if(isError) return res.status(422).json({ message })

  const id = req.params.id;
  const { username, email, password } = req.body;

  //TODO: Adicionar autorizacao

  try {
    const user = await User.findByIdAndUpdate(id, { username, email, password }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: `Updated '${user.username}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  //TODO: Adicionar autorizacao

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `Delete user '${user.username}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

export default router;
