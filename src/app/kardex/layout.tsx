'use client'
import { PropsWithChildren } from 'react'

export default function KardexLayout({ children }: PropsWithChildren) {
  return <section className='border-4  border-amber-600'>{children}</section>
}
