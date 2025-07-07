"use client";

import { Toaster } from "react-hot-toast";
import React from "react";

const ToasterContext: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
};

export default ToasterContext;
