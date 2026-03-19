import { BellIcon } from 'lucide-react'
import React from 'react'

const NoNotificationFound = () => {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='size-16 rounded-full bg-base-300 flex items-center justify-center mb-4'>
            <BellIcon className='size-8 text-base-content opacity-40' />
        </div>

        <h3 className='text-lg font-semibold mb-2'>No notifications yet</h3>
        <p className='text-base-content opacity-70 max-w-md'>
            Friend requests and new connections will appear here once other learners interact with you.
        </p>
      
    </div>
  )
}

export default NoNotificationFound
