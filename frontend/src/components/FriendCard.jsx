import React from 'react'
import { Link } from 'react-router';
import { getLanguageFlag } from '../lib/language.jsx';

const FriendCard = ({friend}) => {
  return (
    <div className='card bg-basse-200 hover:shadow-md transition-shadow'>
        <div className='card-body p-4'>
            <div className='flex items-center gap-3 mb-3'>
                <div className='avatar size-12'>
                    <img src={friend.profilePic} alt={friend.fullName} />
                </div>
                <h3 className="font-semibold turncate">{friend.fullName}</h3>
            </div>

            <div className='flex flex-wrap gap-1.5 mb-3'>
                <span className='badge badge-secondary text-xs'>
                    {getLanguageFlag(friend.nativeLanguage)}
                    Native: {friend.nativeLanguage}
                </span>
                <span className='badge badge-secondary text-xs'>
                    {getLanguageFlag(friend.learningLanguage)}
                    Learning: {friend.learningLanguage}
                </span>
            </div>
            <Link to={`/chat/${friend._id}`} className='btn btn-outline w-full'>
                Send Message
            </Link>
        </div>
    </div>
  )
}

export default FriendCard
