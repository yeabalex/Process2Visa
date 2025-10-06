// app/api/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import mongoose from 'mongoose';
import { User } from '@/db/userModel';
import dotenv from 'dotenv';

dotenv.config();

// Initialize bot once
const bot = new Telegraf(process.env.BOT_TOKEN!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle the update directly
    await handleTelegramUpdate(body);

    // Respond immediately to Telegram
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleTelegramUpdate(update: any) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 10000,
      });
    }

    // Handle different types of updates
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }
  } catch (error) {
    console.error('Error handling Telegram update:', error);
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id.toString();
  const firstName = message.from.first_name || '';
  const text = message.text || '';

  // Handle /start command
  if (text === '/start') {
    try {
      // Check if user already exists in database
      const existingUser = await User.findOne({ telegramChatId: chatId });

      if (existingUser) {
        // User exists - show continue button
        const responseText = `👋 Welcome back, ${firstName}!

You're already registered with us.

Click Continue to proceed:`;

        await sendTelegramMessage(chatId, responseText, {
          reply_markup: {
            inline_keyboard: [[{
              text: '▶️ Continue',
              callback_data: 'continue'
            }]]
          }
        });
      } else {
        // New user - send registration link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
        const registrationUrl = `${baseUrl}/register?chat_id=${chatId}&source=telegram`;

        const responseText = `🎉 Welcome ${firstName}!

To continue using Process2Visa, please complete your registration by clicking the link below:

🔗 ${registrationUrl}

This link will take you to our secure registration page where you can provide your information safely.`;

        await sendTelegramMessage(chatId, responseText, {
          reply_markup: {
            inline_keyboard: [[{
              text: '🌐 Complete Registration',
              url: registrationUrl
            }]]
          }
        });
      }
    } catch (error) {
      console.error('Database error:', error);
      await sendTelegramMessage(chatId, '❌ Sorry, there was an error. Please try again later or contact support.');
    }
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id.toString();
  const data = callbackQuery.data;

  if (data === 'continue') {
    try {
      // Answer the callback query (removes loading state)
      await bot.telegram.answerCbQuery(callbackQuery.id);

      // Send single message with link to root route
      const rootUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

      const responseText = `✅ Great! Click the link below to access Process2Visa:

🔗 ${rootUrl}

Welcome back!`;

      await sendTelegramMessage(chatId, responseText, {
        reply_markup: {
          inline_keyboard: [[{
            text: '🌐 Go to Process2Visa',
            url: rootUrl
          }]]
        }
      });
    } catch (error) {
      console.error('Error handling callback query:', error);
    }
  }
}

async function sendTelegramMessage(chatId: string, text: string, options: any = {}) {
  try {
    await bot.telegram.sendMessage(chatId, text, options);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
