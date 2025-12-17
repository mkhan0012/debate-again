import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activeDebates = await prisma.round.count({
      where: { status: 'ACTIVE' }
    });

    const totalUsers = await prisma.user.count();

    return NextResponse.json({ 
      online: totalUsers, 
      active: activeDebates 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ online: 0, active: 0 }, { status: 500 });
  }
}