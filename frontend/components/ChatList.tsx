"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useSession } from "@node_modules/next-auth/react";
import ChatBox from "./ChatBox";
import { pusherClient } from "@lib/pusher";

interface ChatListProps {
  currentChatId: string;
}

const ChatList: React.FC<ChatListProps> = ({currentChatId }) => {
  const [loading, setLoading] = useState(true);
  const { data: sessions } = useSession();
  const currentUser = sessions?.user;
  const [chats, setChats] = useState<any>([]);

  const [search, setSearch] = useState("");

  const getAllChat = async () => {
    try {
      let res;
      if(search !== ''){
        res = await fetch(`/api/users/${currentUser?.id}/searchChat/${search}`);
      }
      else {
        res = await fetch(`/api/users/${currentUser?.id}`);
      }
      const data = await res.json();
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getAllChat();
    }
    console.log(search);
  }, [currentUser, search]);

  console.log(chats);

  useEffect(() => {
    if (currentUser) {
      pusherClient.subscribe(currentUser?.id);

      const handleChatUpdate = (updatedChat : any) => { // data from backend
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
        pusherClient.unsubscribe(currentUser?.id);
        pusherClient.unbind("update-chat", handleChatUpdate);
        pusherClient.unbind("new-chat", handleNewChat);
      };
    }
  }, [currentUser])

  return loading ? (
    <Loader />
  ) : (
    <div className="chat-list">
      <input
        placeholder="Search chat..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chats">
        {chats?.map((chat:any, index:any) => (
          <ChatBox
            key={index}
            index={index}
            chat={chat}
            currentUser={currentUser}
            currentChatId={currentChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
