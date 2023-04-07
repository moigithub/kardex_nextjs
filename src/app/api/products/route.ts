import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../prisma/db'

export async function GET(request: NextRequest) {
  // const { searchParams } = new URL(request.url)
  const { searchParams } = request.nextUrl
  const barCode = searchParams.get('barCode')
  const sigaCode = searchParams.get('sigaCode')
  const productCode = searchParams.get('productCode')
  const description = searchParams.get('description')
  // console.log('query', searchParams.toString())
  // console.log('query productCode', productCode)
  // console.log('query barCode', barCode)
  // console.log('query sigaCode', sigaCode)
  // console.log('query description', description)

  const product = await prisma.product.findMany({
    where: {
      ...(barCode && { barCode: { startsWith: barCode } }),
      ...(sigaCode && { sigaCode: { startsWith: sigaCode } }),
      ...(productCode && { id: { startsWith: productCode } }),
      ...(description && { description: { contains: description } })
    }
  })

  return NextResponse.json({ data: product })
}
