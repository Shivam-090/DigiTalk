import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

import {
  getRecommendedUsers,
  getOutgoingFriendReqs,
  sendFriendRequest,
  getStreamToken,
  getFriendRequests,
} from "../lib/api";
import { getLanguageFlag } from "../lib/language.jsx";
import { formatChatTime, getMessagePreview, getUnreadCount } from "../lib/chat.js";
import { Link } from "react-router";
import { UserIcon, MapPinIcon, CheckCircleIcon, UserPlusIcon, MessageSquareIcon } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { StreamChat } from "stream-chat";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [recentChats, setRecentChats] = useState([]);
  const [loadingRecentChats, setLoadingRecentChats] = useState(true);
  const { authUser } = useAuthUser();

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["Users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request sent.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not send friend request.");
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs, setOutgoingRequestsIds]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentChats = async () => {
      if (!authUser || !tokenData?.token) return;

      setLoadingRecentChats(true);

      try {
        const client = StreamChat.getInstance(apiKey);

        if (client.userID && client.userID !== authUser._id) {
          await client.disconnectUser();
        }

        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
            },
            tokenData.token,
          );
        }

        const channels = await client.queryChannels(
          {
            type: "messaging",
            members: { $in: [authUser._id] },
          },
          { last_message_at: -1 },
          {
            watch: false,
            state: true,
            limit: 8,
          },
        );

        if (!isMounted) return;

        const items = channels
          .filter((channel) => channel.state.messages.length > 0)
          .map((channel) => {
            const otherMember = Object.values(channel.state.members).find(
              (member) => member.user?.id !== authUser._id,
            )?.user;

            return {
              channelId: channel.id,
              friendId: otherMember?.id,
              fullName: otherMember?.name || "Conversation",
              profilePic: otherMember?.image || "",
              lastMessage: getMessagePreview(channel),
              lastMessageAt: channel.lastMessage()?.created_at || channel.data?.last_message_at,
              unreadCount: getUnreadCount(channel),
            };
          })
          .filter((item) => item.friendId && item.unreadCount > 0);

        setRecentChats(items);
      } catch (error) {
        console.log("Error loading recent chats:", error);
      } finally {
        if (isMounted) {
          setLoadingRecentChats(false);
        }
      }
    };

    loadRecentChats();

    return () => {
      isMounted = false;
    };
  }, [authUser, tokenData]);

  const incomingFriendRequestCount = friendRequests?.incomingFriendRequests?.length || 0;
  const totalUnreadMessages = recentChats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <section className="rounded-[28px] border border-base-300 bg-base-200/70 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Inbox
              </p>
              <div className="mt-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">Unread messages</h2>
                {totalUnreadMessages > 0 && (
                  <span className="badge badge-primary badge-lg">{totalUnreadMessages}</span>
                )}
              </div>
              <p className="mt-2 opacity-70">
                Only conversations with unseen messages appear here.
              </p>
            </div>
          </div>

          {loadingRecentChats ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentChats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center">
              <MessageSquareIcon className="mx-auto size-8 text-primary/70" />
              <h3 className="mt-3 text-lg font-semibold">No unread messages</h3>
              <p className="mt-2 opacity-70">
                New unseen chats will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentChats.map((chat) => (
                <Link
                  key={chat.channelId}
                  to={`/chat/${chat.friendId}`}
                  className="group rounded-2xl border border-base-300 bg-base-100 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="avatar">
                      <div className="size-12 rounded-2xl bg-base-300">
                        {chat.profilePic ? (
                          <img src={chat.profilePic} alt={chat.fullName} />
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="truncate font-semibold">{chat.fullName}</h3>
                        <div className="flex items-center gap-2">
                          {chat.unreadCount > 0 && (
                            <span className="badge badge-primary badge-sm">{chat.unreadCount}</span>
                          )}
                          <span className="shrink-0 text-xs opacity-60">
                            {formatChatTime(chat.lastMessageAt, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm opacity-70">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  Discover
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partner based on your
                  profile and start practicing together!
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/friends" className="btn btn-outline btn-sm">
                  <UserIcon className="size-4 mr-2" />
                  View Friends
                </Link>
                <Link to="/notifications" className="btn btn-outline btn-sm">
                  <UserIcon className="size-4 mr-2" />
                  Friend Requests
                  {incomingFriendRequestCount > 0 && (
                    <span className="badge badge-primary badge-sm ml-1">
                      {incomingFriendRequestCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-basse-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommended users found
              </h3>
              <p className="text-base-content opacity-70">
                We couldn't find any language partners for you at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-basse-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className='badge badge-seconadary'>
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>

                        <span className='badge badge-seconadary'>
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`} disabled={hasRequestBeenSent || isPending} onClick={() => sendRequestMutation(user._id)}>
                        {hasRequestBeenSent ? (
                          <>
                          <CheckCircleIcon className='size-4 mr-2' />
                          Request Sent
                          </>
                        )  : (<>
                        <UserPlusIcon className='size-4 mr-2' />
                        Send Friend Request
                        
                        </>)}

                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;


const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
