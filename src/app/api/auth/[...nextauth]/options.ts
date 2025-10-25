import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt, {compare} from "bcryptjs";
import {prisma} from "@/lib/prisma";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { is } from "zod/locales";
import { use } from "react";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Your Email" },
        password: { label: "Password", type: "password", placeholder: "Your password" },
      },
      async authorize(credentials : any) : Promise<any> {
        await dbConnect();
        try {
            const user = await UserModel.findOne({
                $or : [
                    {email : credentials.identifier},
                    {username : credentials.identifier}
                ]
            })
            if (!user){
                throw new Error("No user found with the given email or username.");
            }
            if (!user.isVerified){
                throw new Error("User account is not verified.");
            }
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

            if (isPasswordCorrect){
                return user;
            }else{
                throw new Error("Incorrect password.");
            }

        } catch (err : any) {
            throw new Error(err)
        }
      },
    }),
  ],
  callbacks: {
        async session({ session, token }) {
            if (token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username

            }
      return session
    },
    async jwt({ token, user }) {
        if (user){
            token._id = user._id?.toString();
            token.isVerified = user.isVerified;
            token.isAcceptingMessages = user.isAcceptingMessages;
            token.username = user.username;

                }

      return token
    }
    
  },
  pages : {
    signIn : '/sign-in',
  },
  session: {
    strategy: "jwt",
  }, 
  secret: process.env.NEXTAUTH_SECRET,
};