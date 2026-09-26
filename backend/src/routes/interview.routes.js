const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middlewares/file.middleware');
const validate = require('../middlewares/validate.middleware');
const { aiLimiter } = require('../middlewares/rateLimiter.middleware');
const { generateReportSchema } = require('../validations/interview.validation');

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description generate new inteview report on basis of user self description, resume, and job description
 * @access private
 */
interviewRouter.post('/',
    authMiddleware.authUser,
    aiLimiter,
    upload.single('resume'),
    validate(generateReportSchema),
    interviewController.generateInterviewReportController);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by ID
 * @access private
 */
interviewRouter.get('/report/:interviewId',
    authMiddleware.authUser,
    interviewController.getInterviewReportByIdController);

/**
 * @route GET /api/interview/
 * @description get all interview reports of the user
 * @access private
 */
interviewRouter.get('/',
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController);

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on basis of user self description, resume, and job description
 * @access private
 */
interviewRouter.post('/resume/pdf/:interviewReportId',
    authMiddleware.authUser,
    aiLimiter,
    interviewController.generateResumePdfController
)

module.exports = interviewRouter;