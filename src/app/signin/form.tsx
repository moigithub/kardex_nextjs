'use client'

import { BuiltInProviderType } from 'next-auth/providers'
import { ClientSafeProvider, LiteralUnion, getProviders, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'

type SignupForm = {
  username: string
  password: string
}

export function Form({ csrfToken }: { csrfToken: string }) {
  // const router = useRouter()
  const [providers, setProviders] =
    useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>>()

  useEffect(() => {
    const getData = async () => {
      const providers = await getProviders()
      setProviders(providers!)
    }
    getData()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupForm>()

  const onSubmit: SubmitHandler<SignupForm> = async data => {
    console.log(data)
    const formData = {
      username: data.username,
      password: data.password
    }

    signIn('credentials', {
      callbackUrl: '/',
      username: data.username,
      password: data.password
    })
  }

  return (
    <main className='flex flex-col max-w-md m-auto'>
      <h1 className='text-3xl font-bold mb-4'>Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
        <div className='block '>
          <label className='text-black-200 text-sm  '>
            username
            <input
              className='ml-2 py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
              {...register('username', { required: true })}
            />
          </label>
          {errors.username && errors.username.type === 'required' && <span>This is required</span>}
        </div>

        <div className='block '>
          <label className='text-black-200 text-sm  '>
            password
            <input
              className='ml-2 py-1 pl-3 pr-10 rounded-md bg-white  text-base shadow-lg ring-1 ring-black ring-opacity-5'
              type='password'
              {...register('password', { required: true })}
            />
          </label>
          {errors.password && errors.password.type === 'required' && <span>This is required</span>}
        </div>
        <button
          className='cursor-pointer rounded-md bg-blue-800 py-2 px-4 text-center text-white shadow-sm ring-1 ring-inset ring-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          type='submit'
        >
          Sign in
        </button>
      </form>

      <p className='w-full text-center italic'>--- or ----</p>
      <section className='mt-4'>
        {!!providers &&
          Object.values(providers)
            .filter(provider => provider.id !== 'credentials')
            .map(provider => (
              <div key={provider.name}>
                <button
                  className='w-full rounded-md bg-blue-400 py-2 px-4 text-center text-white shadow-sm ring-1 ring-inset ring-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  onClick={() => signIn(provider.id)}
                >
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
      </section>

      <div className='mt-8 text-center'>
        <Link href='/signup' className='text-blue-500 font-bold'>
          Create an account
        </Link>
      </div>
    </main>
  )
}
