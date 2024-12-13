import { connectToDB } from "@mongodb/index";
import User from "@models/User";
import { hash } from "bcryptjs";
import { NextResponse } from "@node_modules/next/server";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const { username, email, password } = await req.json();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create new user" },
      { status: 500 }
    );
  }
};
