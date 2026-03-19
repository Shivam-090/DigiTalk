import React from 'react'
import { Link } from 'react-router';
import { getLanguageFlag } from '../lib/language.jsx';
import { formatChatTime } from '../lib/chat.js';
import UserSafetyMenu from './UserSafetyMenu.jsx';

const FriendCard = ({ friend, recentMessage, lastMessageAt, unreadCount = 0 }) => {
  return (
    <div className='card bg-base-100 transition-all duration-300 hover:shadow-lg'>
        <div className='card-body gap-3 p-3.5 sm:p-4'>
            <div className='flex min-w-0 flex-1 items-start gap-3'>
                <div className='avatar shrink-0'>
                    <div className='size-14 rounded-full'>
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                </div>
                <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className="truncate font-semibold text-base">{friend.fullName}</h3>
                          {friend.active === false && (
                            <span className='badge badge-error badge-outline badge-sm'>Deactivated</span>
                          )}
                        </div>
                        {friend.username && (
                          <p className="truncate text-xs text-primary">@{friend.username}</p>
                        )}
                      </div>
                      <div className='flex shrink-0 items-start gap-1'>
                        {unreadCount > 0 && (
                          <span className='badge badge-primary border-0 text-[10px]'>
                            {unreadCount}
                          </span>
                        )}
                        {lastMessageAt && (
                          <span className='text-xs opacity-60'>
                            {formatChatTime(lastMessageAt, { month: "short", day: "numeric" })}
                          </span>
                        )}
                        <UserSafetyMenu user={friend} />
                      </div>
                    </div>

                    <div className='mt-2 flex flex-wrap gap-1.5'>
                        <span className='badge badge-secondary h-auto max-w-full whitespace-normal px-2 py-1.5 text-left text-[11px]'>
                            {getLanguageFlag(friend.nativeLanguage)}
                            Native: {capitalize(friend.nativeLanguage)}
                        </span>
                        <span className='badge badge-secondary h-auto max-w-full whitespace-normal px-2 py-1.5 text-left text-[11px]'>
                            {getLanguageFlag(friend.learningLanguage)}
                            Learning: {capitalize(friend.learningLanguage)}
                        </span>
                    </div>

                    <p className='mt-2 line-clamp-2 break-words text-sm opacity-70'>
                      {recentMessage || "No messages yet"}
                    </p>
                </div>
            </div>

            {friend.active !== false ? (
              <Link to={`/chat/${friend._id}`} className='btn btn-outline btn-sm w-full'>
                  Send Message
              </Link>
            ) : (
              <button className='btn btn-disabled btn-sm w-full'>
                Profile Deactivated
              </button>
            )}
        </div>
    </div>
  )
}

export default FriendCard

const capitalize = (value = "") => {
  if (!value) return "Not set";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
