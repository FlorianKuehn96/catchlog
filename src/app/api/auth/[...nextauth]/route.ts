import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getRedis, keys } from '@/lib/redis';
import type { User } from '@/types';

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      const redis = getRedis();
      // Check if user exists
      const existingUser = await redis.get(keys.user(user.email));
      
      if (!existingUser) {
        // Create new user
        const newUser: User = {
          id: crypto.randomUUID(),
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          subscription: 'free',
          createdAt: new Date().toISOString(),
        };
        
        await redis.set(keys.user(user.email), newUser);
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const redis = getRedis();
        const userData = await redis.get(keys.user(session.user.email));
        if (userData) {
          // Extend session.user with custom fields
          const u = userData as User;
          const su: any = session.user;
          su.id = u.id;
          su.subscription = u.subscription;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
