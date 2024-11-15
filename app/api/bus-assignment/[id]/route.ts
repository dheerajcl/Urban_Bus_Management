import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const busId = request.nextUrl.searchParams.get('busId');
  
  try {
    // First get current assignments
    const assignmentResult = await query(`
      SELECT 
        bsa.bus_id,
        bsa.driver_id,
        bsa.conductor_id,
        bsa.cleaner_id,
        d.name as driver_name,
        c.name as conductor_name,
        cl.name as cleaner_name,
        dr.role_name as driver_role,
        cr.role_name as conductor_role,
        clr.role_name as cleaner_role
      FROM bus_staff_assignments bsa
      LEFT JOIN staff d ON bsa.driver_id = d.id
      LEFT JOIN staff c ON bsa.conductor_id = c.id
      LEFT JOIN staff cl ON bsa.cleaner_id = cl.id
      LEFT JOIN staff_roles dsr ON d.id = dsr.staff_id
      LEFT JOIN staff_roles csr ON c.id = csr.staff_id
      LEFT JOIN staff_roles clsr ON cl.id = clsr.staff_id
      LEFT JOIN roles dr ON dsr.role_id = dr.id
      LEFT JOIN roles cr ON csr.role_id = cr.id
      LEFT JOIN roles clr ON clsr.role_id = clr.id
      WHERE bsa.bus_id = $1
    `, [busId]);

    console.log('Assignment result:', assignmentResult.rows[0]); // Debug log

    if (assignmentResult.rows.length > 0) {
      const currentAssignment = assignmentResult.rows[0];
      
      // Format staff details
      const staffDetails = [
        {
          id: currentAssignment.driver_id,
          name: currentAssignment.driver_name,
          role_name: currentAssignment.driver_role
        },
        {
          id: currentAssignment.conductor_id,
          name: currentAssignment.conductor_name,
          role_name: currentAssignment.conductor_role
        }
      ];

      if (currentAssignment.cleaner_id) {
        staffDetails.push({
          id: currentAssignment.cleaner_id,
          name: currentAssignment.cleaner_name,
          role_name: currentAssignment.cleaner_role
        });
      }

      return NextResponse.json({
        currentAssignments: {
          driver_id: currentAssignment.driver_id,
          conductor_id: currentAssignment.conductor_id,
          cleaner_id: currentAssignment.cleaner_id
        },
        staffDetails: staffDetails.filter(staff => staff.id != null)
      });
    }

    return NextResponse.json({ currentAssignments: null, staffDetails: [] });
  } catch (error) {
    console.error('Error fetching bus assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch bus assignments' }, { status: 500 });
  }
}