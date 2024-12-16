import { format } from "date-fns";
import { Chat, Member, User } from "next-auth";
import React from "react";
import { useRouter } from "@node_modules/next/navigation";

interface ChatBoxProps {
  chat: Chat; // Replace `any` with the proper type if known.
  currentUser?: User; // Replace `any` with a specific type if available.
  index: number;
  currentChatId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chat,
  currentUser,
  currentChatId,
}) => {
  const router = useRouter();
  const otherMembers = chat?.members?.filter(
    (member: Member) => member._id !== currentUser?.id
  );

  const lastMessage =
    chat?.messages?.length > 0 && chat?.messages[chat?.messages.length - 1];

  const seen = lastMessage?.seenBy?.find(
    (member: Member) => member._id === currentUser?.id
  );

  return (
    <div
      className={`chat-box ${chat._id === currentChatId ? "bg-blue-2" : ""}`}
      onClick={() => router.push(`/chats/${chat?._id}`)}
    >
      <div className="chat-info">
        {chat?.isGroup ? (
          <img
            src={chat?.groupPhoto || "/assets/group.png"}
            alt="group-photo"
            className="profilePhoto"
          />
        ) : (
          <img
            src={otherMembers[0].profileImage || "/assets/person.jpg"}
            alt="profile-photo"
            className="profilePhoto"
          />
        )}

        <div className="flex flex-col gap-1">
          {chat?.isGroup ? (
            <p className="text-base-bold">{chat?.name}</p>
          ) : (
            <p className="text-base-bold">{otherMembers[0]?.username}</p>
          )}

          {!lastMessage && <p className="text-small-bold">Started a chat</p>}

          {/* {lastMessage?.photo && (
            
          )} */}
        </div>

        <div>
          <p className="text-base-light text-grey-3">
            {!lastMessage
              ? format(new Date(chat?.createdAt), "p")
              : format(new Date(chat?.lastMessageAt), "p")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
