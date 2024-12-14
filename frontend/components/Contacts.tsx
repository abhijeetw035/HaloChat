"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useSession } from "@node_modules/next-auth/react";
import { RadioButtonUnchecked } from "@node_modules/@mui/icons-material";

interface User {
  _id: string;
  username: string;
  profileImage?: string; // Optional if not all users have a profile image
}

const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const { data: session } = useSession();
  const currentUser = session?.user;

  const getContacts = async () => {
    try {
    const query = search;
      const res = await fetch(search !== "" ? `/api/users/searchContact/${query}` : "/api/users");
      const data = await res.json();
      setContacts(data.filter((user: any) => user._id !== currentUser?.id));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser) getContacts();
    console.log(contacts);
  }, [currentUser, search]);

  return loading ? (
    <Loader />
  ) : (
    <div className="create-chat-container">
      <input
        placeholder="Search contact..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="contact-bar">
        <div className="contact-list">
          <p className="text-body-bold">Select or Deselect</p>

          <div className="flex flex-col flex-1 gap-5 overflow-y-scroll custom-scrollbar">
            {contacts.map((user, index) => (
              <div key={index} className="contact">
                <RadioButtonUnchecked />
                <img
                  src={user.profileImage || "/assets/person.jpg"}
                  alt="profile"
                  className="profilePhoto"
                />
                <p className="text-base-bold">{user.username}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="create-chat">
          <button className="btn">START A NEW CHAT</button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
