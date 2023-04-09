'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()
  console.log({ session })
  return (
    <ul className='py-1 px-2 flex gap-4 items-center bg-orange-300'>
      {session && (
        <>
          <li>
            Signed in as <span className='font-bold'>{session.user?.name}</span>
          </li>
          <li>
            <Link className='font-medium hover:font-medium hover:text-cyan-600' href='/kardex'>
              kardex
            </Link>
          </li>
          <li>
            <button
              className='p-1 shadow rounded hover:font-medium hover:text-cyan-600'
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </li>
        </>
      )}
      {!session && (
        <>
          <li>
            <button className='hover:font-medium hover:text-cyan-600' onClick={() => signIn()}>
              Sign in
            </button>
          </li>
        </>
      )}
    </ul>
  )
}
