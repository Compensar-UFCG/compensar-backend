import { Router, Request, Response } from 'express';
import Question from '../models/question.model';
import CompetenceQuestion from '../models/competenceQuestion.model';

import { getErrorObject } from '../utils/error';
import { checkIsValidQuestionBody, questionValidationSchema, sanitizationQuestionBody } from '../utils/questions.validation';

const router: Router = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObject = (question: any) => question.toObject();

router.get('/questions', async (_: Request, res: Response) => {
  try {
    const questions = await Question.find();

    const questionsAndCompetences = await Promise.all(questions.map(async question => {
      const competenceQuestion = await CompetenceQuestion.find({ question: question._id }).populate('competence');
      const competences = competenceQuestion.map(({ competence }) => competence);
      
      return {
        ...getObject(question),
        competences,
      };
    }));

    res.status(200).json(questionsAndCompetences);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.get('/questions/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const competenceQuestion = await CompetenceQuestion.find({ question: id }).populate('competence');
    const competences = competenceQuestion.map(({ competence }) => competence);
    const questionAndCompetences = {
      ...getObject(question),
      competences,
    };
    res.status(200).json(questionAndCompetences);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.post('/questions', sanitizationQuestionBody, questionValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidQuestionBody(req);

  if(isError) return res.status(422).json({ message })

  const { title, statement, image, font, year, type, alternatives, response } = req.body;

  try {
    const question = new Question({
      title,
      statement,
      image,
      font,
      year,
      type,
      alternatives,
      response
    });

    const newQuestion = await question.save();
    res.status(201).json({ message: `Created '${newQuestion.title}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.put('/questions/:id', sanitizationQuestionBody, questionValidationSchema, async (req: Request, res: Response) => {
  const { isError, message } = checkIsValidQuestionBody(req);

  if(isError) return res.status(422).json({ message })

  const id = req.params.id;
  const {
    title,
    statement,
    image,
    font,
    year,
    type,
    alternatives,
    response
  } = req.body;

  try {
    const question = await Question.findByIdAndUpdate(id, {
      title,
      statement,
      image,
      font,
      year,
      type,
      alternatives,
      response
    }, { new: true });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: `Updated '${question.title}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.delete('/questions/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: `Delete question '${question.title}' with success`});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

export default router;