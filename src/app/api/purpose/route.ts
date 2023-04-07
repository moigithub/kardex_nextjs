import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function GET(request: Request) {
  const purposes = await prisma.purpose.findMany()

  return NextResponse.json({ data: purposes })
}
