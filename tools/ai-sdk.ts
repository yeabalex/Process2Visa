// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt in request body' },
        { status: 400 }
      );
    }

    // Call Google Gemini with grounding + search
    const { text, sources, providerMetadata } = await generateText({
      model: google('gemini-2.5-flash'),
      tools: {
        google_search: google.tools.googleSearch({}),
      },
      prompt,
    });

    // Extract provider metadata safely
    const metadata = providerMetadata?.google as
      | GoogleGenerativeAIProviderMetadata
      | undefined;

    const groundingMetadata = metadata?.groundingMetadata;
    const safetyRatings = metadata?.safetyRatings;

    return NextResponse.json({
      text,
      sources,
      groundingMetadata,
      safetyRatings,
    });
  } catch (err: any) {
    console.error('Error generating text:', err);
    return NextResponse.json(
      { error: 'Failed to generate text', details: err.message },
      { status: 500 }
    );
  }
}
