import { LoaderIcon } from 'lucide-react'
import React from 'react'

const ChatLoader = () => {
  return (
    <div className='h-screen flex flex-col items-center justify-center p-4'>
        <LoaderIcon className='animate-spin size-10 text-primary' />
        <p className='text-gray-500 mt-4'>Connecting to chat...</p>

      
    </div>
  )
}

export default ChatLoader
