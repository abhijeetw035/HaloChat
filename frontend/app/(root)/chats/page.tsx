'use client'

import { useSession } from '@node_modules/next-auth/react';
import React from 'react'

const page = () => {
  const {data : session} = useSession();
  console.log(session);
  return (
    <div>
      Hi this is page
    </div>
  )
}

export default page
