import Chat from "@models/Chat";
import Message from "@models/Message";
import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    await connectToDB();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json("User ID is required", { status: 400 });
    }

    const allChats = await Chat.find({ members: userId })
      .sort({
        lastMessageAt: -1,
      })
      .populate({
        path: "members",
        model: User,
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .exec();

    return NextResponse.json(allChats, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/users/[userId]:", error);
    return NextResponse.json("Failed to get all chats of current user!", {
      status: 500,
    });
  }
};
