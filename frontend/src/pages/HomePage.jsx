import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareIcon } from "lucide-react";
import { StreamChat } from "stream-chat";
import FriendCard from "../components/FriendCard";
import NoFriendFound from "../components/NoFriendFound";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken, getUserFriends } from "../lib/api";
import { getMessagePreview } from "../lib/chat.js";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const HomePage = () => {
  const { authUser } = useAuthUser();
  const [sortedFriends, setSortedFriends] = useState([]);
  const [loadingRecentActivity, setLoadingRecentActivity] = useState(true);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let isMounted = true;

    const loadFriendActivity = async () => {
      if (!friends.length) {
        setSortedFriends([]);
        setLoadingRecentActivity(false);
        return;
      }

      if (!authUser || !tokenData?.token) {
        setSortedFriends(friends);
        setLoadingRecentActivity(false);
        return;
      }

      setLoadingRecentActivity(true);

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
            limit: 100,
          },
        );

        const activityMap = new Map();

        channels.forEach((channel) => {
          const otherMember = Object.values(channel.state.members).find(
            (member) => member.user?.id !== authUser._id,
          )?.user;

          if (!otherMember?.id) return;

          activityMap.set(otherMember.id, {
            recentMessage: getMessagePreview(channel),
            lastMessageAt:
              channel.lastMessage()?.created_at || channel.data?.last_message_at || null,
          });
        });

        const nextFriends = [...friends].sort((first, second) => {
          const firstActivity = activityMap.get(first._id);
          const secondActivity = activityMap.get(second._id);
          const firstTime = firstActivity?.lastMessageAt
            ? new Date(firstActivity.lastMessageAt).getTime()
            : 0;
          const secondTime = secondActivity?.lastMessageAt
            ? new Date(secondActivity.lastMessageAt).getTime()
            : 0;

          if (firstTime !== secondTime) return secondTime - firstTime;
          return first.fullName.localeCompare(second.fullName);
        }).map((friend) => ({
          ...friend,
          recentMessage: activityMap.get(friend._id)?.recentMessage || "",
          lastMessageAt: activityMap.get(friend._id)?.lastMessageAt || null,
          unreadCount: activityMap.get(friend._id)?.unreadCount || 0,
        }));

        if (isMounted) {
          setSortedFriends(nextFriends);
        }
      } catch (error) {
        console.log("Error loading friend activity:", error);
        if (isMounted) {
          setSortedFriends(friends);
        }
      } finally {
        if (isMounted) {
          setLoadingRecentActivity(false);
        }
      }
    };

    loadFriendActivity();

    return () => {
      isMounted = false;
    };
  }, [authUser, friends, tokenData]);

  return (
    <div className="p-2.5 sm:p-3.5">
      <div className="container mx-auto space-y-4">
        

        <div className="rounded-xl border border-base-300 bg-base-200/60 p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquareIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Recent conversations</h2>
             
            </div>
          </div>

          {isLoading || loadingRecentActivity ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : sortedFriends.length === 0 ? (
            <NoFriendFound />
          ) : (
            <div className="space-y-3">
              {sortedFriends.map((friend) => (
                <FriendCard
                  key={friend._id}
                  friend={friend}
                  recentMessage={friend.recentMessage}
                  lastMessageAt={friend.lastMessageAt}
                  unreadCount={friend.unreadCount}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
