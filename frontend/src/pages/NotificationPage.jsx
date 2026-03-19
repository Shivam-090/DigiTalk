import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest } from '../lib/api';
import { BellIcon, UserCheckIcon, ClockIcon, MessageSquareIcon, XIcon } from 'lucide-react';
import NoNotificationsFound from '../components/NoNotificationFound';
import toast from 'react-hot-toast';
import { getLanguageFlag } from '../lib/language.jsx';

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  })

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      toast.success("Friend request accepted.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not accept friend request.");
    },
  })

  const { mutate: rejectRequestMutation, isPending: isRejecting } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      toast.success("Friend request rejected.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not reject friend request.");
    },
  })

  const incomingRequests = friendRequests?.incomingFriendRequests || []
  const acceptedRequests = friendRequests?.acceptedFriendRequests || []
  const isMutatingRequest = isPending || isRejecting;

  return (
    <div className='p-2.5 sm:p-3.5 lg:p-4'>
      <div className='container mx-auto max-w-4xl space-y-5'>
        <h1 className='mb-4 text-xl sm:text-2xl font-bold tracking-tight'>Notifications</h1>

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <span className='loading loading-spinner loading-lg'></span>
          </div>
        ) : (
          <>
          {incomingRequests.length > 0 && (
            <section className='space-y-3'>
              <h2 className='text-lg font-semibold flex items-center gap-2'>
                <UserCheckIcon className='h-4 w-4 text-primary' />
                Friend Requests
                <span className='badge badge-primary ml-2'>{incomingRequests.length}</span>
              </h2>

              <div className='space-y-2.5'>
                {incomingRequests.map((request) => (
                  <div key={request._id} className='card bg-base-200 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='card-body p-3.5'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex min-w-0 items-center gap-2.5'>
                          <div className='avatar w-14 h-14 rounded-full bg-base-300'>
                            <img src={request.sender.profilePic} alt={request.sender.fullName} />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate font-semibold'>{request.sender.fullName}</h3>
                            {request.sender.username && (
                              <p className='truncate text-sm text-primary'>@{request.sender.username}</p>
                            )}
                            <div className='mt-1 flex flex-wrap gap-1.5'>
                              <span className='badge badge-secondary badge-sm h-auto max-w-full whitespace-normal px-2 py-1 text-[11px]'>
                                {getLanguageFlag(request.sender.nativeLanguage)}
                                Native: {capitalize(request.sender.nativeLanguage)}
                              </span>
                              <span className='badge badge-outline badge-sm h-auto max-w-full whitespace-normal px-2 py-1 text-[11px]'>
                                {getLanguageFlag(request.sender.learningLanguage)}
                                Learning: {capitalize(request.sender.learningLanguage)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex w-full gap-2 sm:w-auto'>
                          <button className='btn btn-outline btn-sm flex-1 sm:flex-none' onClick={() => rejectRequestMutation(request._id)} disabled={isMutatingRequest}>
                            <XIcon className='mr-1 size-4' />
                            Reject
                          </button>
                          <button className='btn btn-primary btn-sm flex-1 sm:flex-none' onClick={() => acceptRequestMutation(request._id)} disabled={isMutatingRequest}>
                            Accept
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}

              </div>

            </section>
          )}

          {acceptedRequests.length > 0 && (
            <section className='space-y-3'>
              <h2 className='text-lg font-semibold flex items-center gap-2'>
                <BellIcon className='h-4 w-4 text-success' />
                New Connections
                <span className='badge badge-success ml-2'>{acceptedRequests.length}</span>
              </h2>

              <div className='space-y-2.5'>
                {acceptedRequests.map((notification)=>(
                  <div key={notification._id} className='card bg-base-200 shadow-sm hover:shadow-md transition-shadow'>
                    <div className='card-body p-3.5'>
                      <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                        <div className='avatar mt-1 size-10 rounded-full'>  
                          <img src={notification.recipient.profilePic} alt={notification.recipient.fullName} />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='truncate font-semibold'>{notification.recipient.fullName}</h3>
                            {notification.recipient.username && (
                              <p className='truncate text-sm text-primary'>@{notification.recipient.username}</p>
                            )}
                            <p className='my-1 break-words text-sm'>
                              {notification.recipient.fullName} accepted your friend request  
                            </p>
                            <p className='text-xs flex items-center opacity-70'>
                              <ClockIcon className='h-3 w-3 mr-1' />
                              Recently
                            </p>                   
                          </div>
                          <div className='badge badge-success self-start'>
                            <MessageSquareIcon className='h-3 w-3 mr-1' />
                            New Friend
                          </div>          
                  </div>
                  </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
            <NoNotificationsFound />
          )}
          </>
        )}
        </div> 
      
    </div>
  )
}

export default NotificationPage

const capitalize = (value = "") => {
  if (!value) return "Not set";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
