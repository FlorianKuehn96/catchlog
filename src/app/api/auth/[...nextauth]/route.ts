import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getRedis, keys } from '@/lib/redis';
import type { User, Spot } from '@/types';

// Vorausgefüllte deutsche Gewässer
const DEFAULT_SPOTS: Omit<Spot, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Bodensee', lat: 47.6365, lng: 9.3965, type: 'lake' },
  { name: 'Chiemsee', lat: 47.8689, lng: 12.4784, type: 'lake' },
  { name: 'Starnberger See', lat: 47.8926, lng: 11.3044, type: 'lake' },
  { name: 'Ammersee', lat: 48.0047, lng: 11.1156, type: 'lake' },
  { name: 'Wannsee', lat: 52.4411, lng: 13.1431, type: 'lake' },
  { name: 'Müggelsee', lat: 52.4333, lng: 13.6333, type: 'lake' },
  { name: 'Rhein', lat: 50.9375, lng: 6.9603, type: 'river' },
  { name: 'Donau', lat: 48.3665, lng: 10.8925, type: 'river' },
  { name: 'Elbe', lat: 53.5511, lng: 9.9937, type: 'river' },
  { name: 'Mosel', lat: 49.7496, lng: 6.6371, type: 'river' },
  { name: 'Main', lat: 50.0826, lng: 8.2406, type: 'river' },
  { name: 'Neckar', lat: 49.4875, lng: 8.4660, type: 'river' },
];

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
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
        
        // Create default spots for new user
        const spotIds: string[] = [];
        for (const spotData of DEFAULT_SPOTS) {
          const spotId = crypto.randomUUID();
          const spot: Spot = {
            ...spotData,
            id: spotId,
            userId: newUser.id,
            createdAt: new Date().toISOString(),
          };
          await redis.set(keys.spot(spotId), spot);
          spotIds.push(spotId);
        }
        await redis.set(keys.spotsByUser(newUser.id), spotIds);
      }
      
      return true;
    },
    async session({ session, token }: any) {
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
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
