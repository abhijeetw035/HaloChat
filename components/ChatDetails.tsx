"use client";

import { useSession } from "@node_modules/next-auth/react";
import { Chat, Member } from "next-auth";
import React, { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import Link from "@node_modules/next/link";
import { AddPhotoAlternate } from "@node_modules/@mui/icons-material";
import { CldUploadButton } from "@node_modules/next-cloudinary/dist";
import MessageBox from "./MessageBox";
import { pusherClient } from "@lib/pusher";

interface ChatDetailsProp {
  chatId: string;
}

const ChatDetails: React.FC<ChatDetailsProp> = ({ chatId }) => {
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<Chat>();
  const [otherMembers, setOtherMembers] = useState<Member[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { data: session } = useSession();
  const currentUser = session?.user;

  const currUser = currentUser?.id;

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
  }, [currentUser, chatId]);

  const sendText = async () => {
    if (!text.trim() || isSending) return;
    
    const messageText = text.trim();
    setText("");
    setIsSending(true);
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser?.id,
          text: messageText,
        }),
      });

      if (!res.ok) {
        setText(messageText);
        console.error("Failed to send message");
      }
    } catch (error) {
      setText(messageText);
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  const sendPhoto = async (result: any, currentUserId: string | undefined) => {
    if (!currentUserId || isSending) {
      console.error(
        "User ID is undefined. Please ensure the user is authenticated."
      );
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser?.id || "",
          text: "",
          photo: result?.info?.secure_url,
        }),
      });

      if (res.ok) {
        console.log("Photo Send");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    pusherClient.subscribe(chatId);

    const handleMessage = async (newMessage: any) => {
      console.log("Received new message via Pusher:", newMessage);
      setChat((prevChat: any) => {
        if (!prevChat) return prevChat;
        
        const messageExists = prevChat.messages?.some(
          (msg: any) => msg._id === newMessage._id
        );
        
        if (messageExists) {
          return prevChat;
        }
        
        return {
          ...prevChat,
          messages: [...(prevChat?.messages || []), newMessage],
        };
      });
    };

    pusherClient.bind("new-message", handleMessage);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind("new-message", handleMessage);
    };
  }, [chatId]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages])

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
                src={otherMembers?.[0]?.profileImage || "/assets/person.jpg"}
                alt="profile photo"
                className="profilePhoto"
              />
              <div className="text">
                <p>{otherMembers?.[0]?.username || "Unknown User"}</p>
              </div>
            </>
          )}
        </div>

        <div className="chat-body">
          {chat?.messages?.map((message, index) => (
            <MessageBox
              key={message._id || index}
              message={message}
              currentUser={currentUser}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="send-message">
          <div className="prepare-message">
            <CldUploadButton
              options={{ maxFiles: 1 }}
              onSuccess={(result) => {
                sendPhoto(result, currentUser?.id);
              }}
              uploadPreset="halochat123"
            >
              <AddPhotoAlternate
                sx={{
                  fontSize: "35px",
                  color: "#737373",
                  cursor: "pointer",
                  "&:hover": { color: "red" },
                }}
              />
            </CldUploadButton>
            <input
              type="text"
              placeholder="Write a message..."
              className="input-field"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim() && !isSending) {
                  e.preventDefault();
                  sendText();
                }
              }}
              disabled={isSending}
              required
            />
          </div>

          <div 
            onClick={sendText}
            style={{ 
              opacity: (text.trim() && !isSending) ? 1 : 0.5, 
              cursor: (text.trim() && !isSending) ? 'pointer' : 'not-allowed' 
            }}
          >
            <img src="/assets/send.jpg" alt="send" className="send-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
