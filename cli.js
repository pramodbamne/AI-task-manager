// cli.js
const axios = require('axios');

// --- ⬇️ CONFIGURATION: PASTE YOUR SESSION COOKIE HERE ⬇️ ---

const SESSION_COOKIE = 'connect.sid=s%3AX_tNk9FFWl8fJ-TjeAe-pMagXXlhNLdI.dtYygBWh4XVgqiWyRDdpX1k1VjdlekIRWq%2BsYzogMKc';

// --- ⬆️ NO MORE CHANGES NEEDED BELOW THIS LINE ⬆️ ---

const API_URL = 'http://localhost:5000/api/tasks/ai';

// Get the full command from the terminal arguments
const command = process.argv.slice(2).join(' ');

// --- VALIDATION ---
if (!command) {
    console.error('❌ Please provide a command. Usage: node cli.js <your natural language command>');
    process.exit(1);
}

if (!SESSION_COOKIE || !SESSION_COOKIE.includes('s%3A')) {
    console.error('❌ Please open the cli.js file and paste your session cookie into the SESSION_COOKIE variable.');
    process.exit(1);
}

/**
 * Sends the command to the AI endpoint.
 * @param {string} taskCommand The natural language command for the task.
 */
async function sendAiCommand(taskCommand) {
    console.log(`\n🤖 Sending command to AI: "${taskCommand}"`);
    try {
        const response = await axios.post(API_URL, {
            command: taskCommand
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': SESSION_COOKIE
            }
        });

        console.log('\n✅ Success! The AI created the following task:');
        // Pretty print the JSON response
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ Error communicating with the server:');
        console.error(error.response?.data || error.message);
    }
}

sendAiCommand(command);