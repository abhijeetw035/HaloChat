import { pusherServer } from "@lib/pusher";
import Chat from "@models/Chat";
import Message from "@models/Message";
import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const body = await req.json();
    const { chatId, currentUserId, text, photo } = body;
    console.log(chatId, currentUserId, text, photo);
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return NextResponse.json("User not found!", { status: 404 });
    }

    const newMessage = await Message.create({
      chat: chatId,
      sender: currentUser,
      text,
      photo,
      seenBy: currentUserId,
    });

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage._id },
        $set: { lastMessageAt: newMessage.createdAt },
      },
      { new: true }
    )
      .populate({
        path: "messages",
        model: Message,
        populate: { path: "sender seenBy", model: User },
      })
      .populate({
        path: "members",
        model: User,
      })
      .exec();

       /* Trigger a Pusher event for a specific chat about the new message */
      await pusherServer.trigger(chatId, "new-message", newMessage);

      /* Triggers a Pusher event for each member of the chat about the chat update with the latest message */
      const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];
      updatedChat.members.forEach(async (member : any) => {
        try {
          await pusherServer.trigger(member._id.toString(), "update-chat", {
            id: chatId,
            messages: [lastMessage]
          });
        } catch (err) {
          console.error(`Failed to trigger update-chat event`);
        }
      });

    return NextResponse.json(newMessage, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create new message", { status: 500 });
  }
};
