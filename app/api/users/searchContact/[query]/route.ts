import User from "@models/User";
import { connectToDB } from "@mongodb";
import { NextResponse } from "@node_modules/next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ query: string }> }
) => {
    try {
        await connectToDB();

        const { query } = await params;

        const searchedContacts = await User.find({
            $or: [ // Search by username or email
                { username: { $regex: query, $options: "i" } }, // i means Case-insensitive, $regex is a MongoDB operator
                { email: { $regex: query, $options: "i" } },
            ],
        });
        
        return NextResponse.json(searchedContacts, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Failed to search contacts" }, { status: 500 });
    }
};
