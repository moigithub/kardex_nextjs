import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function GET(request: Request) {
  const product = await prisma.product.findMany()

  return NextResponse.json({ data: product })
}
