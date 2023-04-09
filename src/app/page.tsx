// import { Inter } from 'next/font/google'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'
// const inter = Inter({ subsets: ['latin'] })

export default async function Home() {
  const session = await getServerSession(authOptions)
  console.log('session', session)
  return (
    <main>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      server session: {JSON.stringify(session)}
    </main>
  )
}
