import React from 'react'
import { Link } from 'react-router'

const NoFriendFound = () => {
  return (
    <div className='card bg-base-200 p-6 text-center'>
        <h3 className='font-semibold text-lg mb-2'>No friends yet</h3>
        <p className='text-base-content opacity-70'>
            Add people from the Discover People page to start practicing together.
        </p>
        <div className='mt-4'>
          <Link to="/add-friends" className='btn btn-primary btn-sm'>
            Go to Discover People
          </Link>
        </div>
      
    </div>
  )
}

export default NoFriendFound
