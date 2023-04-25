import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";

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

interface ITheme {
    buttonText?: string | undefined;
    brandColor?: string | undefined;
}

function html(params: { url: string; host: string; theme: ITheme }) {
    const { url, host, theme } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = theme.brandColor || "#346df1";
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme.buttonText || "#fff",
    };

    return `
  <body style="background: ${color.background};">
    <table style="margin-top: 10px;" width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          Sign in to <strong>${escapedHost}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                  in</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`;
}

const prisma = new PrismaClient();

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: +process.env.EMAIL_SERVER_PORT!,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            secret: process.env.NEXTAUTH_SECRET,
            async sendVerificationRequest(params) {
                const { identifier, url, provider, theme } = params;
                const { host } = new URL(url);
                const transport = createTransport(provider.server);
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: text({ url, host }),
                    html: html({ url, host, theme }),
                });
                const failed = result.rejected.concat(result.pending).filter(Boolean);
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
                }
            },
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
    pages: {
        signIn: "/auth/signin",
        // signOut: "/auth/signout",
        // error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify-request", // (used for check email message)
        // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
    },
};
export default NextAuth(authOptions);
