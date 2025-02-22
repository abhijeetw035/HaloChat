import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const POST = async (req: Request, context: { params: { userId: string } }) => {
  try {
    await connectToDB();

    const { params } = context; // Await params to access userId correctly
    const { userId } = await params;
    console.log("Received userId:", userId);

    const body = await req.json();

    const { username, profileImage } = body;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        profileImage,
      },
      { new: true }
    );

    return new NextResponse(JSON.stringify(updateUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
};
