// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.analyzeTaskCommand = async (command) => {
    const today = new Date().toISOString().slice(0, 10);

    // --- UPDATED AND MORE DETAILED PROMPT ---
    const prompt = `
        Analyze the user's command and extract task details into a JSON object.
        Your response MUST be a valid JSON object with the following keys: "description", "priority", and "deadline".

        - "description": (string) The main action item from the command. This field is required.
        - "priority": (string) Must be one of "Low", "Normal", "High", or "Urgent". Default to "Normal" if not specified.
        - "deadline": (string) Must be in YYYY-MM-DD format. Calculate dates like "tomorrow" or "next Friday" based on today's date, which is ${today}. Default to today's date if not specified.

        User Command: "${command}"

        JSON Output:
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        const jsonString = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Error analyzing command with Gemini:', error);
        throw new Error('Failed to analyze task command.');
    }
};

exports.analyzeChatIntent = async (message, tasks, user) => {
    const today = new Date().toISOString().slice(0, 10);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are a helpful assistant for a task manager app. Your goal is to understand a user's message and convert it into a structured JSON command.

        CONTEXT:
        - Today's Date: ${today}
        - Current User: ${JSON.stringify(user)}
        - User's Current Tasks: ${JSON.stringify(tasks)}

        Based on the user's message, determine the correct "intent" and extract any necessary parameters.

        POSSIBLE INTENTS & PARAMETERS:
        1.  "addTask": For creating a new task. The parameter should be the full natural language "command" for creation.
            - Example Message: "remind me to call the doctor tomorrow" -> {"intent": "addTask", "command": "call the doctor tomorrow"}
        2.  "deleteTask": For deleting a task. Find the most likely task from the context and return its "task_id".
            - Example Message: "delete the task about the project report" -> {"intent": "deleteTask", "task_id": 15}
        3.  "queryAllTasks": For listing all tasks. No parameters needed.
            - Example Message: "show me all my tasks" -> {"intent": "queryAllTasks"}
        4.  "queryTasksByPriority": For finding tasks of a specific priority. The parameter is "priority".
            - Example Message: "what are my urgent tasks?" -> {"intent": "queryTasksByPriority", "priority": "Urgent"}
        5.  "queryUser": For retrieving user details. No parameters needed.
            - Example Message: "what is my email?" -> {"intent": "queryUser"}

        User Message: "${message}"

        Your response MUST be a single, clean JSON object.
        JSON Output:
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error analyzing chat intent with Gemini:", error);
        return { intent: "error", message: "Sorry, I had trouble understanding that." };
    }
};