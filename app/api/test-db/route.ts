import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    return NextResponse.json({ status: "success", message: "Database connection healthy!" });
  } catch (error) {
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}