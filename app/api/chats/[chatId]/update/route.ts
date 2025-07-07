import Chat from "@models/Chat";
import { connectToDB } from "@mongodb";

export const POST = async (
  req: Request,
  context: { params: { chatId: string } }
) => {
  try {
    await connectToDB();

    const { params } = context;
    const { chatId } = await params;

    const body = await req.json();

    const {name, groupPhoto} = body;

    const updatedGroupChat = await Chat.findByIdAndUpdate(chatId, {
        name, groupPhoto
    }, { new: true });

    return new Response(JSON.stringify(updatedGroupChat), {status : 200})
    
  } catch (error) {
    console.log(error);
    return new Response("Failed to update group chat info", { status: 500 });
  }
};
