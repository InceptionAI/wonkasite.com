import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { getUser } from "@/server/admin-function/get-user";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "user",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user",
        };
      },
    }),
  ],
  // pages: {
  //   signIn: `/login`,
  //   verifyRequest: `/login`,
  //   error: "/login", // Error code passed in query string as ?error=
  // },
  // adapter: PrismaAdapter(prisma),
  // session: { strategy: "jwt" },
  // cookies: {
  //   sessionToken: {
  //     name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
  //       domain: VERCEL_DEPLOYMENT
  //         ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  //         : undefined,
  //       secure: VERCEL_DEPLOYMENT,
  //     },
  //   },
  // },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (account && account.provider === "github") {
        if (user) {
          token.user = user;
        }
        return token;
      }
      const domain = process.env.NEXTAUTH_URL ?? "local-108";
      const userDb = await getUser(domain, token.sub as string);
      if (userDb) {
        return {
          ...token,
          name: userDb.name,
          email: userDb.email,
          picture: userDb.imageURL,
          sub: userDb.id,
          role: userDb.role,
        };
      } else if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token, user }) => {
      // Assuming gh_username is only set for GitHub users
      if (user?.gh_username) {
        session.user = {
          ...session.user,
          // @ts-expect-error This is necessary because the 'username' property is not defined in the 'token' object.
          id: token.sub,
          // @ts-expect-error This is necessary because the 'username' property is not defined in the 'token' object.
          username: token?.user?.username || token?.user?.gh_username,
        };
        return session;
      }
      console.log("session", session, "token", token);
      session.user = {
        ...session.user,
        image: token.picture as string,
        id: token.sub as string,
        email: token.email as string,
        role: (token.role as string) ?? "user",
        // username: token?.user?.gh_username ?? "user",
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<any | null>;
}

export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });
    if (!site) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, site, key);
  };
}

export function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        site: true,
      },
    });
    if (!post || post.userId !== session.user.id) {
      return {
        error: "Post not found",
      };
    }

    return action(formData, post, key);
  };
}
