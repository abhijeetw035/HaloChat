"use client";

import { CloudUpload, GroupOutlined, PersonOutline } from "@node_modules/@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "@node_modules/next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "@components/Loader";
import axios from "@node_modules/axios";
import { useParams } from "@node_modules/next/navigation";

type Inputs = {
  example: string;
  exampleRequired: string;
  username: string;
  profileImage: string;
  name: string;
  groupPhoto: string;
};

const GroudpInfo = () => {
  const [userId, setUserId] = useState("");
  const [chat, setChat] = useState<any>(null);

  const { chatId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      getChatDetails();
    }
  }, [chatId]); 

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors: error },
  } = useForm<Inputs>();

  const getChatDetails = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      setChat(data);
      setLoading(false);
      reset({
        name: data?.name,
        groupPhoto: data?.groupPhoto,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateGroupChat = async (data: Inputs) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/chats/${chatId}/update`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);

      window.location.reload();
      if (res.status === 200) {
        toast.success("Photo updated successfully");
        window.location.reload();
      } else {
        toast.error("Something went wrong");
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };


  const uploadPhoto = async (result: any) => {
    setValue("groupPhoto", result?.info?.secure_url);
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="profile-page">
      <h1 className="text-heading3-bold">Edit Group Info</h1>

      <form className="edit-profile" onSubmit={handleSubmit(updateGroupChat)}>
        <div className="input">
          <input
            {...register("name", {
              required: "Group chat name is required",
            })}
            type="text"
            placeholder="Group chat name"
            className="input-field"
          />
          <GroupOutlined sx={{ color: "#737373" }} />
        </div>
        {error?.name && (
          <p className="text-red-500">{error.name.message}</p>
        )}

        <div className="flex items-center justify-between">
          <img
            src={
              watch("groupPhoto") ||
              "/assets/group.png"
            }
            alt="profile"
            className="w-40 h-40 rounded-full"
          />
          <CldUploadButton
            options={{ maxFiles: 1 }}
            onSuccess={uploadPhoto}
            uploadPreset="halochat123"
          >
            <p className="text-body-bold">Upload new photo</p>
          </CldUploadButton>
        </div>

        <div className="flex flex-wrap gap-3">
          {chat?.members?.map((member : any, index : any) => (
            <p className="selected-contact" key={index}>{member.username}</p>
          ))}
        </div>

        <button className="btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default GroudpInfo;
