import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../prisma/db'

declare module 'next-auth' {
  interface User {
    username: string
  }
}
/**
 * NOTES:
 * strategy:"database" :
 *   GITHUB provider, do NOT work with getSession, only getServerSession
 *      generates a JWT_SESSION_ERROR - JWEInvalid compact JWE
 *   credentialsProvider, do NOT work with getServerSession, only with client getSession
 *----
 * strategy:"jwt" :
 *   works OK with both GITHUB and credentialsProvider
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/signin'
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  // session: {
  //   jwt: false
  // },
  session: {
    strategy: 'jwt',
    // strategy: 'database',
    maxAge: 90 * 24 * 60 * 60 // 90 days, change it as you like
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    }),
    // ...add more providers here
    CredentialsProvider({
      // id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'john.doe'
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your super secure password'
        }
      },
      async authorize(credentials) {
        console.log('auth credentials', credentials)
        if (!credentials?.password || !credentials?.username) {
          throw new Error('Invalid Credentials')
        }

        try {
          let maybeUser = await prisma.mUser.findFirst({
            where: {
              username: credentials.username
            }
            // select: {
            //   id: true,
            //   email: true,
            //   password: true,
            //   name: true,
            //   role: true,
            // },
          })

          if (!maybeUser) {
            return null
          } else {
            const isValid = bcrypt.compareSync(credentials.password, maybeUser.password!)

            if (!isValid) {
              throw new Error('Invalid Credentials')
            }
          }
          console.log('auth user', maybeUser)
          return maybeUser
          // {
          //   id: maybeUser.id,
          //   // email: maybeUser.email,
          //   username: maybeUser.username
          //   // role: maybeUser.role
          // }
        } catch (error) {
          console.log(error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log('jwt cb', token, user, account, profile, isNewUser)
      if (user) {
        token.id = user.id
        // token.role = user.role
        token.name = user.username
      }

      return token
    },
    async session({ session, token, user }) {
      console.log('session cb', session, token, user)

      const sess: DefaultSession = {
        ...session
        //   user: {
        //     ...session.user,
        //     id: token.id as string,
        //     role: token.role as string,
        // },
      }
      return sess
      // return { ...session, username: token.username, user: { ...session.user, name: 'bob' } }
    }
  },
  // jwt: {
  //   secret: process.env.NEXTAUTH_SECRET,
  //   encryption: true,
  //   maxAge: 5 * 60 * 1000
  // },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
