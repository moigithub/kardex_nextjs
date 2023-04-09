import { getCsrfToken } from 'next-auth/react'
import { Form } from './form'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export default async function SignIn() {
  const csrfToken = (await getCsrfToken()) || ''
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/')
  }

  return <Form csrfToken={csrfToken} />
}
