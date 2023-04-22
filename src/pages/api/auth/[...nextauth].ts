import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import EmailProvider from "next-auth/providers/email";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's name. */
            name: string;
            email: string;
            image: string;
            id: string;
        };
    }
}

const prisma = new PrismaClient();

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            secret: process.env.NEXTAUTH_SECRET,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        session: async ({ session, user }: Awaited<{ session: Session; user: any }>) => {
            if (session?.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    // pages: {
    //     signIn: "/auth/signin",
    //     // signOut: "/auth/signout",
    //     // error: "/auth/error", // Error code passed in query string as ?error=
    //     // verifyRequest: "/auth/verify-request", // (used for check email message)
    //     // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
    // },
};
export default NextAuth(authOptions);
