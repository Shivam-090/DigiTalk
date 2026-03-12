import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getFriendRequests, getStreamToken, getUserFriends } from '../lib/api';
import { formatChatTime, getMessagePreview, getUnreadCount } from '../lib/chat.js';
import { StreamChat } from "stream-chat";

import { Channel, ChannelHeader, MessageList, MessageInput, Thread, Chat, Window } from "stream-chat-react";
import toast from 'react-hot-toast';
import ChatLoader from '../components/ChatLoader';
import CallButton from '../components/CallButton';
import { BellIcon, BellRingIcon, HomeIcon, MenuIcon, MessageSquareIcon, XIcon } from 'lucide-react';

const apiKey = import.meta.env.VITE_STREAM_API_KEY
const getStreamImage = (image) =>
  typeof image === "string" && /^https?:\/\//i.test(image) ? image : undefined;

const ChatPage = () => {
  const { id: targetUserId } = useParams()

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [channelMeta, setChannelMeta] = useState({});
  const [friendsSidebarOpen, setFriendsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });
  const {data:tokenData} = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  })
  const incomingFriendRequestCount = friendRequests?.incomingFriendRequests?.length || 0;
  const NotificationIcon = incomingFriendRequestCount > 0 ? BellRingIcon : BellIcon;

  useEffect(()=> {
    let isMounted = true;

    const initChat = async ()=>{
      if(!authUser || !tokenData?.token || !targetUserId) return;

      setLoading(true);
      try{

        const client = StreamChat.getInstance(apiKey);

        if (client.userID && client.userID !== authUser._id) {
          await client.disconnectUser();
        }

        if (!client.userID) {
          await client.connectUser({
            id: authUser._id,
            name: authUser.fullName,
            image: getStreamImage(authUser.profilePic),
          }, tokenData.token);
        }

        const channelId = [authUser._id, targetUserId].sort().join("-")

        const channels = await client.queryChannels(
          {
            type: "messaging",
            members: { $in: [authUser._id] },
          },
          { last_message_at: -1 },
          {
            watch: true,
            state: true,
            limit: 30,
          },
        );

        const metadata = {};
        channels.forEach((item) => {
          const otherMember = Object.values(item.state.members).find(
            (member) => member.user?.id !== authUser._id,
          )?.user;

          if (!otherMember?.id) return;

          metadata[otherMember.id] = {
            lastMessage: getMessagePreview(item),
            lastMessageAt: item.lastMessage()?.created_at || item.data?.last_message_at,
            unreadCount: getUnreadCount(item),
          };
        });

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        })

        await currChannel.watch();

        if (!isMounted) return;

        setChatClient(client);
        setChannel(currChannel);
        setChannelMeta({
          ...metadata,
          [targetUserId]: {
            lastMessage: getMessagePreview(currChannel),
            lastMessageAt: currChannel.lastMessage()?.created_at || currChannel.data?.last_message_at,
            unreadCount: getUnreadCount(currChannel),
          },
        });

      }catch(error){
        console.log("Error initializing chat:", error);
        toast.error(error?.message || "Failed to load chat. Please try again later.")

      }finally{
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    initChat();

    return () => {
      isMounted = false;
    };
  },[tokenData, authUser, targetUserId] )

  const handleVideoCall = async () => {
    if (!channel?.id) return;

    const callUrl = `${window.location.origin}/call/${channel.id}`;

    try {
      await channel.sendMessage({
        text: `Starting a video call, join me here: ${callUrl}`,
      });

      toast.success("Video call link sent to the chat!")
    } catch (error) {
      toast.error(error?.message || "Could not start the video call.");
    }
  }

  if(loading || loadingFriends || !chatClient || !channel) return <ChatLoader />;
  return (
    <div className='chat-shell h-[calc(100vh-4rem)]'>
      <div className='chat-layout h-full overflow-hidden'>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className='flex h-full min-h-0 w-full'>
            {friendsSidebarOpen && (
              <button
                className='fixed inset-0 z-40 bg-black/40 lg:hidden'
                onClick={() => setFriendsSidebarOpen(false)}
                aria-label='Close conversations overlay'
              />
            )}
            <aside className={`chat-sidebar fixed inset-y-0 left-0 z-50 w-80 shrink-0 transform transition-transform duration-200 lg:static lg:z-auto lg:flex lg:translate-x-0 lg:flex-col ${friendsSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:w-80`}>
              <div className='border-b border-base-300 px-5 py-5'>
                <div className='flex items-center justify-between gap-3'>
                  <Link to="/" className='btn btn-ghost justify-start gap-3 px-0 text-base-content hover:bg-transparent hover:text-base-content'>
                    <HomeIcon className='size-5 text-primary' />
                    <span className='font-semibold'>Home</span>
                  </Link>
                  <button className='btn btn-ghost btn-circle text-base-content hover:bg-base-300/60 lg:hidden' onClick={() => setFriendsSidebarOpen(false)}>
                    <XIcon className='size-5' />
                  </button>
                </div>
                <div className='mt-4 flex items-center justify-between'>
                  <div>
                    <p className='text-3xl font-semibold tracking-tight text-base-content'>Chats</p>
                    <p className='mt-1 text-xs uppercase tracking-[0.24em] text-base-content/50'>Recent conversations</p>
                  </div>
                  <Link to="/notifications" className='btn btn-ghost btn-circle btn-sm relative text-base-content hover:bg-base-300/60'>
                    <NotificationIcon className='size-5 opacity-90' />
                    {incomingFriendRequestCount > 0 && (
                      <span className='badge badge-primary border-0 text-[10px] absolute -right-1 -top-1 min-w-4'>
                        {incomingFriendRequestCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className='flex-1 space-y-2 overflow-y-auto p-3'>
                {friends.length === 0 ? (
                  <div className='rounded-3xl border border-base-300 bg-base-100 p-5 text-center'>
                    <MessageSquareIcon className='mx-auto size-7 text-primary/80' />
                    <p className='mt-3 text-sm text-base-content/70'>Add friends to start chatting.</p>
                  </div>
                ) : (
                  friends.map((friend) => {
                    const isActive = friend._id === targetUserId;

                    return (
                      <Link
                        key={friend._id}
                        to={`/chat/${friend._id}`}
                        onClick={() => setFriendsSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-3xl border px-3 py-3 transition-all ${
                          isActive
                            ? "border-primary/30 bg-base-100 shadow-md"
                            : "border-transparent bg-transparent hover:border-base-300 hover:bg-base-100"
                        }`}
                      >
                        <div className='avatar'>
                          <div className='size-12 rounded-2xl bg-base-300 ring-1 ring-base-300'>
                            <img src={friend.profilePic} alt={friend.fullName} />
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-start justify-between gap-2'>
                            <p className='truncate font-semibold text-base-content'>{friend.fullName}</p>
                            <div className='flex items-center gap-2'>
                              {channelMeta[friend._id]?.unreadCount > 0 && (
                                <span className='badge badge-primary border-0 text-[10px]'>
                                  {channelMeta[friend._id].unreadCount}
                                </span>
                              )}
                              <span className='shrink-0 text-[11px] text-base-content/50'>
                                {formatChatTime(channelMeta[friend._id]?.lastMessageAt)}
                              </span>
                            </div>
                          </div>
                          <p className='mt-1 truncate text-sm text-base-content/70'>
                            {channelMeta[friend._id]?.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </aside>

            <div className='chat-main flex min-w-0 flex-1 border-l basis-0 flex-col'>
              <div className='chat-main-header flex items-center justify-between gap-3 px-4 py-3 sm:px-5'>
                <button
                  className='btn btn-ghost btn-circle text-base-content hover:bg-base-300/60 lg:hidden'
                  onClick={() => setFriendsSidebarOpen(true)}
                >
                  <MenuIcon className='size-5' />
                </button>
                <div className='min-w-0 flex-1'>
                  <ChannelHeader />
                </div>
                <CallButton handleVideoCall={handleVideoCall} />
              </div>
              <div className='border-b border-base-300 bg-base-200 px-3 py-3 lg:hidden'>
                <div className='flex gap-2 overflow-x-auto pb-1'>
                  {friends.map((friend) => {
                    const isActive = friend._id === targetUserId;

                    return (
                      <Link
                        key={friend._id}
                        to={`/chat/${friend._id}`}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                          isActive
                            ? "border-primary/30 bg-base-100 text-base-content"
                            : "border-base-300 bg-base-100 text-base-content/80"
                        }`}
                      >
                        <div className='avatar'>
                          <div className='size-8 rounded-full bg-base-300'>
                            <img src={friend.profilePic} alt={friend.fullName} />
                          </div>
                        </div>
                        <span className='max-w-28 truncate'>{friend.fullName}</span>
                        {channelMeta[friend._id]?.unreadCount > 0 && (
                          <span className='badge badge-primary border-0 text-[10px]'>
                            {channelMeta[friend._id].unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <Window>
                <MessageList />
                <MessageInput focus />
              </Window>
            </div>
            <Thread />
          </div>
        </Channel>
      </Chat>
      </div>
    </div>
  )
}

export default ChatPage
