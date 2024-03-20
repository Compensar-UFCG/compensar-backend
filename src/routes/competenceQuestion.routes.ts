import { Router, Request, Response } from 'express';
import CompetenceQuestion from '../models/competenceQuestion.model';
import Question from '../models/question.model';
import Competence from '../models/competence.model';

import { getErrorObject } from '../utils/error';

const router: Router = Router();

router.get('/questions/:id/competences', async (req: Request, res: Response) => {
  const questionId = req.params.id;

  try {
    const competenceQuestion = await CompetenceQuestion.find({ question: questionId }).populate('question').populate('competence');
    
    if(!competenceQuestion)
      return res.status(404).json({ message: 'Question not found'});

    if(competenceQuestion.length === 0)
      return res.status(200).json(competenceQuestion);

    const competences = competenceQuestion.map(({ competence }) => competence);

    const competencesByQuestionId = {
      id: competenceQuestion[0].question.id,
      title: competenceQuestion[0].question.title,
      competences
    }

    res.status(200).json(competencesByQuestionId);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.get('/competences/:id/questions', async (req: Request, res: Response) => {
  const competenceId = req.params.id;

  try {
    const competenceQuestion = await CompetenceQuestion.find({ competence: competenceId }).populate('question').populate('competence');
    
    if(!competenceQuestion)
      return res.status(404).json({ message: 'Competence not found'});

    if(competenceQuestion.length === 0)
      return res.status(200).json(competenceQuestion);

    const questions = competenceQuestion.map(({ question }) => question);

    const questionsByCompetenceId = {
      id: competenceQuestion[0].competence._id,
      title: competenceQuestion[0].competence.title,
      questions
    }

    res.status(200).json(questionsByCompetenceId);
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.post('/questions/competences', async (req: Request, res: Response) => {
  const { questionId, competenceId } = req.body;

  try {
    const existingCompetence = await Competence.findById(competenceId);
    if (!existingCompetence)
      return res.status(404).json({ message: 'Competence not found' });

    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion)
      return res.status(404).json({ message: 'Question not found' });

    const existingRelation = await CompetenceQuestion.findOne({ competence: competenceId, question: questionId });

    if(existingRelation)
      return res.status(409).json({ message: 'Exist relation' });

    const competenceQuestion = new CompetenceQuestion({
      competence: competenceId,
      question: questionId
    });

    await competenceQuestion.save();
    res.status(201).json({ message: 'Created with success'});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

router.delete('/questions/:questionId/competences/:competenceId', async (req: Request, res: Response) => {
  const { questionId, competenceId } = req.params;

  try {
    const existingCompetence = await Competence.findById(competenceId);
    if (!existingCompetence)
      return res.status(404).json({ message: 'Competence not found' });

    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion)
      return res.status(404).json({ message: 'Question not found' });

    const deletedRelation = await CompetenceQuestion.findOneAndDelete({ competence: competenceId, question: questionId });

    if (!deletedRelation) {
      return res.status(404).json({ message: 'Relation not found' });
    }
    res.status(200).json({ message: 'Delete relation with success'});
  } catch (err) {
    const error = getErrorObject(err);
    res.status(error.status).json(error);
  }
});

export default router;
