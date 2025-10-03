// app/api/telegram/route.js
import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!);
const registrationQueue = new Queue('registration', { connection });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Push job to queue instead of handling directly
    await registrationQueue.add('telegram-update', { update: body });

    // Respond immediately to Telegram
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
