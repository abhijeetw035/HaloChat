import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profileImage?: string | null;
    };
  }
  
  interface User {
    id: string;
  }
  
  interface Member {
    _id: string;
    email: string;
    password: string;
    profileImage: string;
    username: string;
  }
  
  interface Chat {
    _id: string;
    isGroup: boolean;
    groupPhoto: string;
    members: Member[];
    name: string;
    messages: any[];
    lastMessageAt: string;
    createdAt: string;
    profileImage?: string | null; 
  }
  
}
