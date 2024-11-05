import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return NextResponse.json([]);
  }

  try {
    const result = await query(
      'SELECT DISTINCT stop_name FROM stops WHERE stop_name ILIKE $1 LIMIT 10',
      [`%${term}%`]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching stops:', error);
    return NextResponse.json({ error: 'Failed to fetch stops' }, { status: 500 });
  }
}