import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const result = await query(`
      SELECT r.*, 
             json_agg(json_build_object('id', s.id, 'stop_name', s.stop_name, 'stop_order', s.stop_order) ORDER BY s.stop_order) as stops
      FROM routes r
      LEFT JOIN stops s ON r.id = s.route_id
      WHERE r.id = $1
      GROUP BY r.id
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching route details:', error)
    return NextResponse.json({ error: 'Failed to fetch route details' }, { status: 500 })
  }
}