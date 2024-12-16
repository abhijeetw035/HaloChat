"use client";
import { useSession } from "@node_modules/next-auth/react";
import { Chat, Member } from "next-auth";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import Link from "@node_modules/next/link";

interface ChatDetailsProp {
  chatId: string;
}

const ChatDetails: React.FC<ChatDetailsProp> = ({ chatId }) => {
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<Chat>();
  const [otherMembers, setOtherMembers] = useState<Member[]>([]);

  const { data: session } = useSession();
  const currentUser = session?.user;

  const [text, setText] = useState("");

  const getChatDetails = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setChat(data);
      setOtherMembers(
        data?.members?.filter(
          (member: Member) => member._id !== currentUser?.id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser && chatId) {
      getChatDetails();
    }
    setLoading(false);
    console.log(chat);
  }, [currentUser, chatId]);

  return loading ? (
    <Loader />
  ) : (
    <div className="pb-20">
      <div className="chat-details">
        <div className="chat-header">
          {chat?.isGroup ? (
            <>
              <Link href={`/chats/${chatId}/group-info`}>
                <img
                  src={chat?.groupPhoto || "/assets/group.png"}
                  alt="group-photo"
                  className="profilePhoto"
                />
              </Link>

              <div className="text">
                <p>
                  {chat?.name} &#160; &#183; &#160; {chat?.members?.length}{" "}
                  members
                </p>
              </div>
            </>
          ) : (
            <>
              <img
                src={otherMembers[0]?.profileImage || "/assets/person.jpg"}
                alt="profile photo"
                className="profilePhoto"
              />
              <div className="text">
                <p>{otherMembers[0]?.username}</p>
              </div>
            </>
          )}
        </div>

        <div className="chat-body">
        
        </div>
        
      </div>
    </div>
  );
};

export default ChatDetails;
