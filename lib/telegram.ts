/**
 * Telegram messaging utility for the X-Edu Consultancy platform
 */

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_notification?: boolean;
}

/**
 * Sends a message via Telegram Bot API
 * @param message Telegram message object
 * @returns Promise<boolean> - true if successful
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN environment variable is not set');
      return false;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Telegram message sent successfully:', result);
    return true;

  } catch (error) {
    console.error('Error sending telegram message:', error);
    return false;
  }
}

/**
 * Sends a purchase confirmation message to user
 * @param chat_id User's telegram chat ID
 * @param serviceName Name of the purchased service
 * @param serviceId ID of the purchased service
 * @returns Promise<boolean> - true if successful
 */
export async function sendPurchaseConfirmationMessage(
  chat_id: string,
  serviceName: string,
  serviceId?: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
  const courseLink = serviceId ? `${baseUrl}/${serviceId}` : baseUrl;
  
  const message = `🎉 Congratulations! Your payment for "${serviceName}" has been confirmed.\n\nYour course is now ready and you can start learning immediately!\n\n📚 <a href="${courseLink}">Click here</a> to access your course materials.\n\nIf you have any questions, feel free to reach out to our support team.`;

  return await sendTelegramMessage({
    chat_id,
    text: message,
    parse_mode: 'HTML'
  });
}

/**
 * Sends a welcome message when user starts a course
 * @param chat_id User's telegram chat ID
 * @param courseName Name of the course
 * @returns Promise<boolean> - true if successful
 */
export async function sendCourseWelcomeMessage(
  chat_id: string,
  courseName: string
): Promise<boolean> {
  const message = `🚀 Welcome to your "${courseName}" course!

You've been enrolled and your progress has been set up. You can now:

✅ Track your learning progress
📖 Access course materials
🎯 Complete assignments and quizzes
🏆 Earn certificates upon completion

Start your learning journey today!`;

  return await sendTelegramMessage({
    chat_id,
    text: message,
    parse_mode: 'HTML'
  });
}
