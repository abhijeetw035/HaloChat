"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useSession } from "@node_modules/next-auth/react";
import ChatBox from "./ChatBox";
import { pusherClient } from "@lib/pusher";

interface ChatListProps {
  currentChatId: string;
}

const ChatList: React.FC<ChatListProps> = ({ currentChatId }) => {
  const [loading, setLoading] = useState(true);
  const { data: sessions } = useSession();
  const currentUser = sessions?.user;
  const [chats, setChats] = useState<any>([]);
  const [search, setSearch] = useState("");

  const getAllChat = async () => {
    try {
      console.log("Fetching chats for user:", currentUser?.id);
      setLoading(true);
      let res;
      if(search !== ''){
        res = await fetch(`/api/users/${currentUser?.id}/searchChat/${search}`);
      }
      else {
        res = await fetch(`/api/users/${currentUser?.id}`);
      }
      
      console.log("API Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Chat data received:", data);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ChatList useEffect - currentUser:", currentUser);
    if (currentUser?.id) {
      getAllChat();
    } else {
      console.log("No current user, setting loading to false");
      setLoading(false);
    }
  }, [currentUser?.id, search]);

  useEffect(() => {
    if (currentUser?.id) {
      pusherClient.subscribe(currentUser.id);

      const handleChatUpdate = (updatedChat : any) => {
        setChats((allChats : any) =>
          allChats.map((chat : any) => {
            if (chat._id === updatedChat.id) {
              return { ...chat, messages: updatedChat.messages };
            } else {
              return chat;
            }
          })
        );
      };

      const handleNewChat = (newChat : any) => {
        setChats((allChats : any) => [...allChats, newChat]);
      }

      pusherClient.bind("update-chat", handleChatUpdate);
      pusherClient.bind("new-chat", handleNewChat);

      return () => {
        pusherClient.unsubscribe(currentUser.id);
        pusherClient.unbind("update-chat", handleChatUpdate);
        pusherClient.unbind("new-chat", handleNewChat);
      };
    }
  }, [currentUser?.id])

  if (loading) {
    console.log("ChatList is loading...");
    return <Loader />;
  }

  if (!currentUser) {
    console.log("No current user found");
    return <div className="text-center text-gray-500 py-4">Please login to view chats</div>;
  }

  console.log("Rendering ChatList with chats:", chats);

  return (
    <div className="chat-list">
      <input
        placeholder="Search chat..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chats">
        {chats && chats.length > 0 ? (
          chats.map((chat: any, index: any) => (
            <ChatBox
              key={chat._id || index}
              index={index}
              chat={chat}
              currentUser={currentUser}
              currentChatId={currentChatId}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No chats found. Start a conversation!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
