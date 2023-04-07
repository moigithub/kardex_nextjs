import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function GET(request: Request) {
  const stores = await prisma.store.findMany()

  return NextResponse.json({ data: stores })
}
