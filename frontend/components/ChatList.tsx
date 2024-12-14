"use client";

import { useState } from "react";
import Loader from "./Loader";

const ChatList = () => {
  const [loading, setLoading] = useState(false);

  return loading ? (
    <Loader />
  ) : (
    <div className="chat-list">
      <input placeholder="Search chat..." className="input-search" />
    </div>
  );
};

export default ChatList;
