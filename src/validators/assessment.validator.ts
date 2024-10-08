import { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from "express-validator";
import { ObjectId } from "mongodb";
// import { upload } from "../utils/upload.utils";


const validateMarkingGuide = [
  body("markingGuide")
    .optional()
    .bail()
    .custom((value) => {
      if (typeof value !== "object" || value === null) {
        throw new Error("Marking guide must be an object");
      }

      const { question, expectedAnswer, keywords } = value;

      if (!question || typeof question !== "string") {
        throw new Error("Marking guide must contain a valid question");
      }

      if (!expectedAnswer || typeof expectedAnswer !== "string") {
        throw new Error("Marking guide must contain a valid expectedAnswer");
      }

      if (!Array.isArray(keywords)) {
        throw new Error("Keywords must be an array of strings");
      }

      for (let keyword of keywords) {
        if (typeof keyword !== "string") {
          throw new Error("All keywords must be valid strings");
        }
      }

      return true; 
    }),
];


const validateOptionalFile = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(422).json({
          success: false,
          errors: [{ field: "file", message: "Invalid file type" }],
        });
      }
    }
    next();
  },
];

const errorResponse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.type,
        message: error.msg,
      })),
    });
  }
  next();
};

export const createAssessmentValidator = [
  param("instructorId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid organization id');
      }
      return true;
    }),

  param("courseId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid course id');
      }
      return true;
    }),

  body("title")
    .notEmpty()
    .isString()
    .withMessage("Please provide the title of the assessment"),

  body("question")
    .notEmpty()
    .isString()
    .withMessage("Question is a required field"),

  body("highestAttainableScore")
    .notEmpty()
    .isNumeric()
    .withMessage(
      "Please provide the highest attaniable score and as an integer"
    ),

  validateMarkingGuide,

  validateOptionalFile,

  errorResponse,
];

export const submissionValidator = [
  param("learnerId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid learner id');
      }
      return true;
    }),

  param("assessmentId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid assessment id');
      }
      return true;
    }),

  body("answerText")
    .notEmpty()
    .isString()
    .withMessage("Please provide the title of the assessment as a text"),

  validateOptionalFile,

  errorResponse,
];

export const gradeAssessmentValidator = [
  param("submissionId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid submission id');
      }
      return true;
    }),
  param("instructorId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid instructor id');
      }
      return true;
    }),

  body("score")
    .notEmpty()
    .isNumeric()
    .withMessage("Please provide the score as an integer"),

  body("comments").optional().isString(),

  body("useAI")
    .notEmpty()
    .isBoolean()
    .withMessage(
      "Please select if you want learners' submissions to be graded automatically or manually"
    ),

  errorResponse,
];

export const viewLearnersValidator = [
  param("assessmentId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid assessment id');
      }
      return true;
    }),

  param("instructorId")
    .optional()
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid instructor id');
      }
      return true;
    }),

  errorResponse,
];
