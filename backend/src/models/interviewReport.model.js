const mongoose = require('mongoose');

/**
 * - job description schema : String
 * - resume text : String
 * - self description : String
 * - matchScore : Number
 * 
 * - Technical questions : 
 *          [{
 *          question: String,
 *          answer: String,
 *          intention: String,}]
 * - Behavioral questions : 
 *          [{
 *          question: String,
 *          answer: String,
 *          intention: String,}]
 * - Skill Gaps : 
 *          [{
 *         skill: String,
 *         severity : {
 * type: String,
 * enum: ['low', 'medium', 'high'],}
 * }]
 * - Preparation Plan : [{
 *      day: Number,
 *      focus: String,
 *      tasks: [String],}]
 * 
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, "Severity is required"]
    }
},{
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
},{
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String, 
        required: [true, 'Job description is required']
    },
    resume:{
        type: String,
    },
    selfDescription:{
        type: String,
    },
    matchScore:{
        type: Number,
        min: [0, 'Match score cannot be less than 0'],
        max: [100, 'Match score cannot be greater than 100']
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    title: {
        type: String,
        required: [true, 'Title is required']}
},{
    timestamps: true
})

const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);

module.exports = interviewReportModel;