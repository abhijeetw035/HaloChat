import Chat from "@models/Chat";
import User from "@models/User";
import { connectToDB } from "@mongodb"
import { NextResponse } from "@node_modules/next/server";

export const GET = async (
  req: Request, 
  { params }: { params: Promise<{userId: string, query: string}> }
) => {
    try {
        await connectToDB();

        const { userId, query } = await params;

        const searchedChat = await Chat.find({
            members: userId,
            name: { $regex: query, $options: "i" }
        }).populate({ 
            path: "members",
            model: User
        }).exec();

        return NextResponse.json(searchedChat, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json("Failed to search chat", { status: 500 });
    }
}