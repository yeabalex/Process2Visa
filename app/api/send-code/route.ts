import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import mongoosePromise from '@/db/db.config';
import Otp from '@/db/otpModel';
import { User } from '@/db/userModel';
import dotenv from 'dotenv';
dotenv.config();

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    
    // Validate and normalize phone number
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 403 }
      );
    }
    
    const normalizedPhone = phoneNumber.replace(/\s+/g, ''); // remove all spaces
    
    if (!normalizedPhone.startsWith('+')) {
      return NextResponse.json(
        { success: false, message: 'Phone number must start with + and include country code' },
        { status: 400 }
      );
    }
    
    // Validate that BOT_TOKEN exists
    if (!process.env.BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Bot configuration error' },
        { status: 500 }
      );
    }
    
    await mongoosePromise;
    
    const verificationCode = generateSixDigitCode();
    
    const phoneChat = await User.findOne({ phoneNumber: normalizedPhone });
    if (!phoneChat) {
      return NextResponse.json(
        { success: false, message: 'Phone number not registered with any chatId' },
        { status: 404 }
      );
    }
    
    const { telegramChatId } = phoneChat;
    console.log(telegramChatId);
    
    // Clear previous OTPs
    await Otp.deleteMany({ chatId: telegramChatId });
    
    // Create new OTP
    await Otp.create({
      chatId: telegramChatId,
      otp: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    
    // Send via Telegram
    const bot = new Telegraf(process.env.BOT_TOKEN!);
    const message = `🔐 Your verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes. Please don't share it with anyone.`;
    await bot.telegram.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
    
    // ✅ Return success with redirect URL instead of redirecting
    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      redirectUrl: `/otp?chatId=${telegramChatId}`
    });
    
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send verification code',
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}