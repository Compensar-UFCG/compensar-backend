import { Router, Request, Response } from 'express';
import Competence from '../models/competence.model';
import { checkIsValidCompetenceBody, competenceValidationSchema, sanitizationCompetenceBody,  } from '../utils/competences.validation';
import { getErrorObject } from '../utils/error';

const router: Router = Router();
router.get('/', async (_: Request, res: Response) => {
  try {
    const competences = await Competence.find();
    res.status(200).json(competences);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.get('/competences', async (_: Request, res: Response) => {
  try {
    const competences = await Competence.find();
    res.status(200).json(competences);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.get('/competences/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const competence = await Competence.findById(id);
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json(competence);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.post('/competences', sanitizationCompetenceBody, competenceValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidCompetenceBody(req);

  if(isError) return res.status(422).json({ message })

  const competence = new Competence({
    title: req.body.title,
    description: req.body.description,
  });

  try {
    const newCompetence = await competence.save();
    res.status(201).json(newCompetence);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.put('/competences/:id', sanitizationCompetenceBody, competenceValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidCompetenceBody(req);

  if(isError) return res.status(422).json({ message })

  const id = req.params.id;
  const { title, description } = req.body;

  try {
    const competence = await Competence.findByIdAndUpdate(id, { title, description }, { new: true });
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.json(competence);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.delete('/competences/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const competence = await Competence.findByIdAndDelete(id);
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json({ message: `Delete competence '${competence.title}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

export default router;
