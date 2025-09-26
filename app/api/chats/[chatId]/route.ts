import Chat from "@models/Chat";
import Message from "@models/Message";
import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) => {
  try {
    await connectToDB();

    const { chatId } = await params;

    const chat = await Chat.findById(chatId)
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

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("Failed to get chat!", { status: 500 });
  }
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) => {
  try {
    await connectToDB();

    const { chatId } = await params;

    const body = await req.json();

    const { currentUserId } = body;

    await Message.updateMany(
      { chat: chatId },
      { $addToSet: { seenBy: currentUserId } },
      { new: true }
    )
      .populate({
        path: "sender seenBy",
        model: User,
      })
      .exec();

    return new Response("Seen all messages by current user", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to update seen messages", { status: 500 });
  }
};
