
import jwt from "jsonwebtoken";
import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import type { Request, Response } from "express";



export const createQuestion = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('📝 Received question data:', JSON.stringify(req.body, null, 2));

    const quiz = await Quiz.findOne({ quizId: req.body.quizId });

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: `Quiz with quizId ${req.body.quizId} not found`,
      });
      return;
    }

    // Check if quiz already has 15 or more questions
    const currentQuestionCount = quiz.questions?.length || 0;
    if (currentQuestionCount >= 15) {
      res.status(400).json({
        success: false,
        message: `Quiz ${req.body.quizId} already has the maximum number of questions (15). Cannot add more questions.`,
        currentQuestionCount: currentQuestionCount
      });
      return;
    }

    // Create the question
    console.log('✅ Creating question in database...');
    const question = await Question.create(req.body);
    console.log('✅ Question created with ID:', question._id);

    // Add the question to the quiz
    if (!quiz.questions) {
      quiz.questions = [];
    }
    quiz.questions.push(question._id as any);
    await quiz.save();
    console.log('✅ Question added to quiz:', quiz.quizId);

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('❌ Error creating question:', error);
    res.status(400).json({
      success: false,
      message: "Error Adding Question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const editQuestion =  async (req: Request, res: Response): Promise<any> => {
  try{
    const questionId = req.params.questionId;
    const updatedData = req.body;
    const question = await Question.findByIdAndUpdate(questionId, updatedData, { new: true });
    if(!question){
      return res.status(404).json({ success: false, message: `Question with ID ${questionId} not found.` });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('❌ Error editing question:', error);
    res.status(400).json({
      success: false,
      message: "Error Editing Question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<any> => { 

  try {
    const questionId = req.params.questionId;
    const question = await Question.findByIdAndDelete(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: `Question with ID ${questionId} not found.` });
    }

  
    // Also remove the question from any quizzes that reference it
    await Quiz.updateMany(
      { questions: question._id },
      { $pull: { questions: question._id } }
    );
    res.status(200).json({ success: true, message: `Question with ID ${questionId} deleted successfully.` });
  } catch (error) {
    console.error('❌ Error deleting question:', error);
    res.status(400).json({
      success: false,
      message: "Error Deleting Question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getAllQuestions = async (req: Request, res: Response): Promise<any> => {

  try {

    const questions = await Question.find();
    res.status(200).json({ success: true, data: questions });
    
  } catch (error) {

    console.error('❌ Error fetching questions:', error);
    res.status(400).json({
      success: false,
      message: "Error Fetching Questions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    
  }

}


export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.questionId;
    console.log("Fetching question with ID:", questionId);

    const question = await Question.findById(questionId);
    if(!question){
      res.status(404).json({ success: false, message: `Question with ID ${questionId} not found.` });
    }
   res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('❌ Error fetching question by ID:', error);
    res.status(400).json({
      success: false,
      message: "Error Fetching Question",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}