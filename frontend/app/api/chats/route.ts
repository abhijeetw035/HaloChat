import Chat from "@models/Chat";
import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const body = await req.json();

    const { currentUserId, members, isGroup, name, groupPhoto } = body;

    // Define 'query' to find chats
    const query = isGroup
      ? { isGroup, name, groupPhoto, members: [currentUserId, ...members] }
      : { members: { $all: [currentUserId, ...members], $size: 2 } };

    let chat = await Chat.findOne(query);

    if (!chat) {
      chat = await new Chat(
        isGroup ? query : { members: [currentUserId, ...members] }
      );

      await chat.save();

      const updateAllMembers = chat.members.map(async (memberId: string) => {
        await User.findByIdAndUpdate(
          memberId,
          {
            $addToSet: { chats: chat._id },
          },
          { new: true }
        );
      });
      Promise.all(updateAllMembers);
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to create a new chat", { status: 500 });
  }
};
