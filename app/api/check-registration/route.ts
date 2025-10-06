import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/userModel';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Check if user exists with this chat ID
    const user = await User.findOne({ telegramChatId: chatId });

    return NextResponse.json({
      registered: !!user,
      user: user ? {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        preferredCountry: user.preferredCountry,
      } : null
    });

  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
