"use client";

import { CloudUpload, PersonOutline } from "@node_modules/@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { useSession } from "@node_modules/next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "@components/Loader";
import axios from "@node_modules/axios";

type Inputs = {
  example: string;
  exampleRequired: string;
  username: string;
  profileImage: string;
};

const Profile = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [userId, setUserId] = useState("");

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors: error },
  } = useForm<Inputs>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      reset({
        username: user?.username || "", // Fallback to an empty string
        profileImage: user?.profileImage || "/assets/person.jpg", // Default profile image
      });
    setUserId(user.id);
    }
    setLoading(false);
  }, [user]);

  const updateUser = async (data: Inputs) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/users/update/${userId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);

      window.location.reload();
      if (res.status === 200) {
        toast.success("Profile updated successfully");
        window.location.reload();
      } else {
        toast.error("Something went wrong");
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(user);

  const uploadPhoto = async (result: any) => {
    setValue("profileImage", result?.info?.secure_url);
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="profile-page">
      <h1 className="text-heading3-bold">Edit Your Profile</h1>

      <form className="edit-profile" onSubmit={handleSubmit(updateUser)}>
        <div className="input">
          <input
            {...register("username", {
              required: "Username is required",
              validate: (value) =>
                value.length >= 3 ||
                "Username should be at least 3 characters long",
            })}
            type="text"
            placeholder="Username"
            className="input-field"
          />
          <PersonOutline sx={{ color: "#737373" }} />
        </div>
        {error?.username && (
          <p className="text-red-500">{error.username.message}</p>
        )}

        <div className="flex items-center justify-between">
          <img
            src={
              watch("profileImage") ||
              user?.profileImage ||
              "/assets/person.jpg"
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

        <button className="btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
