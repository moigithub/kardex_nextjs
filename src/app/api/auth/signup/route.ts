import { NextResponse } from 'next/server'
import { prisma } from '../../../../prisma/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request, response: Response) {
  const data = await request.json()

  console.log('data', data)
  try {
    let checkUser = await prisma.mUser.findUnique({
      where: {
        username: data.username
      }
    })
    if (checkUser) {
      // throw new Error('Already exist')
      return NextResponse.json({ msg: 'Already exist' }, { status: 400 })
    }

    const user = await prisma.mUser.create({
      data: {
        username: data.username,
        password: bcrypt.hashSync(data.password, 8)
      }
    })

    const token = jwt.sign({ userId: user.id }, 'shhhhh')
    return new NextResponse(JSON.stringify(user), {
      headers: {
        'Set-Cookie': `token=${token}; Max-Age=8640; Path=/; httponly=true`
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ msg: '' }, { status: 400 })
  }
}
