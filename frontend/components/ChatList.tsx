"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useSession } from "@node_modules/next-auth/react";
import ChatBox from "./ChatBox";

const ChatList = () => {
  const [loading, setLoading] = useState(true);
  const { data: sessions } = useSession();
  const currentUser = sessions?.user;
  const [chats, setChats] = useState([]);
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
        {chats?.map((chat, index) => (
          <ChatBox
            key={index}
            index={index}
            chat={chat}
            currentUser={currentUser}
            // currentChatId={currentChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
