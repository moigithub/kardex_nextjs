import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function GET(request: Request) {
  const documentType = await prisma.documentType.findMany()

  return NextResponse.json({ data: documentType })
}
