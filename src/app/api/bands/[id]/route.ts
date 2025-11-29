/**
 * Band Detail API
 * DELETE /api/bands/[id] - Delete a band
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Delete band (albums will be deleted automatically due to cascade)
    await prisma.band.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Band deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting band:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete band' },
      { status: 500 }
    );
  }
}
