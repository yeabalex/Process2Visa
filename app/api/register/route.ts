import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/userModel';
import PhoneChat from '@/db/phoneToChatModel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      telegramChatId,
      fullName,
      age,
      phoneNumber,
      nationality,
      educationLevel
    } = body;

    // Validate required fields (telegramChatId is optional for web registrations)
    if (!fullName || !age || !phoneNumber || !nationality || !educationLevel) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if telegramChatId is provided (for Telegram bot registrations)
    if (telegramChatId) {
      // Check if user already exists with this chat ID
      const existingUser = await User.findOne({ telegramChatId });
      if (existingUser) {
        return NextResponse.json({ error: 'User already registered' }, { status: 409 });
      }
    }

    // Create new user
    const newUser = new User({
      telegramChatId: telegramChatId.toString(),
      fullName: fullName.trim(),
      age: parseInt(age),
      phoneNumber: phoneNumber.trim(),
      nationality: nationality.trim(),
      educationLevel
    });

    await newUser.save();

    // Create phone-chat mapping only if we have a telegramChatId
    if (telegramChatId) {
      const newPhoneChat = new PhoneChat({
        phoneNumber: phoneNumber.trim(),
        chatId: telegramChatId.toString()
      });

      await newPhoneChat.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        telegramChatId: newUser.telegramChatId
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);

    // Handle duplicate phone number error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const duplicateError = error as { code: number; keyPattern?: Record<string, unknown> };
      if (duplicateError.keyPattern?.phoneNumber) {
        return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
