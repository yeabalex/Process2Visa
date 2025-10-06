import { NextResponse } from 'next/server';
import Country from '@/db/countryModel';

export async function GET() {
  try {
    const countries = await Country.find({}, '_id name fullName').sort({ name: 1 });

    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
