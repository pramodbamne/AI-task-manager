const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email notification when a new task is created.
 */
exports.sendTaskCreationEmail = async (userEmail, taskDescription, taskDeadline) => {
    const formattedDeadline = new Date(taskDeadline).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        await resend.emails.send({
            from: 'Task Manager <onboarding@resend.dev>',
            to: [userEmail],
            subject: '✅ New Task Created!',
            html: `
                <div>
                    <h1>New Task Alert!</h1>
                    <p>A new task has been added to your list:</p>
                    <p><strong>Task:</strong> ${taskDescription}</p>
                    <p><strong>Deadline:</strong> ${formattedDeadline}</p>
                    <p>Log in to your dashboard to see all your tasks.</p>
                </div>
            `
        });
        console.log(`Task creation email sent to ${userEmail}`);
    } catch (error) {
        console.error("Error sending task creation email:", error);
    }
};

/**
 * Sends a password reset OTP to the user's email.
 */
exports.sendPasswordResetEmail = async (userEmail, otp) => {
    try {
        await resend.emails.send({
            from: 'Task Manager <onboarding@resend.dev>',
            to: [userEmail],
            subject: 'Your Password Reset OTP',
            html: `
                <div>
                    <h1>Password Reset Request</h1>
                    <p>Use the following One-Time Password (OTP) to reset your password. This OTP is valid for 10 minutes.</p>
                    <h2 style="font-size: 24px; letter-spacing: 2px;"><strong>${otp}</strong></h2>
                </div>
            `
        });
        console.log(`Password reset OTP sent to ${userEmail}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};