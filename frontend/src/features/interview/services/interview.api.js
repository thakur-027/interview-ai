import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})


/** 
 * @description Generate a new interview report based on the provided details
 */

export const generateInterviewReport = async ({ resumeFile, selfDescription, jobDescription }) => {

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('selfDescription', selfDescription);
    formData.append('jobDescription', jobDescription);

    const response = await api.post('/api/interview/', formData, {
        headers:{
            "Content-Type": "multipart/form-data"
        }
    })
    return response;
}

/** 
* @description Get an interview report by its ID
*/

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response;
}

/**
 * @description Get all interview reports for the current user
 */

export const getAllInterviewReports = async () => {
    const response = await api.get('/api/interview/');
    return response;
}

/**
 * 
 * @description Generate a resume PDF based on the provided interview report ID
 */

export const generateResumePdf = async (interviewReportId) => {
    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        {},
        { responseType: 'blob' }
    );
    return response.data;
}