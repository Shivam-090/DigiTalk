import { useQuery } from "@tanstack/react-query";
import { MessageSquareIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import FriendCard from "../components/FriendCard";
import NoFriendFound from "../components/NoFriendFound";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Your Circle
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Friends
            </h1>
            <p className="mt-2 max-w-2xl opacity-70">
              Open any friend card and jump straight into chat.
            </p>
          </div>

          <div className="stats bg-base-200 shadow-sm">
            <div className="stat px-6 py-4">
              <div className="stat-figure text-primary">
                <UserIcon className="size-5" />
              </div>
              <div className="stat-title">Connected Friends</div>
              <div className="stat-value text-3xl">{friends.length}</div>
              <div className="stat-desc">Ready to message</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquareIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Start a conversation</h2>
              <p className="text-sm opacity-70">
                Select a friend and send a message from their chat page.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendFound />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Link to="/" className="btn btn-ghost">
            Discover more people
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
