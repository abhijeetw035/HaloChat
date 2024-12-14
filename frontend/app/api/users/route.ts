import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const GET = async (req: Request) => {
    try {
        await connectToDB();

        const allUsers = await User.find({});

        return NextResponse.json(allUsers, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Failed to get all users" }, { status: 500 });
    }
}