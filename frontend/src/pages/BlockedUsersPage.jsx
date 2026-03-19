import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getBlockedUsers, unblockUser } from "../lib/api";
import { getLanguageFlag } from "../lib/language.jsx";

const BlockedUsersPage = () => {
  const queryClient = useQueryClient();
  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
  });

  const { mutate: unblockUserMutation, isPending } = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("User unblocked successfully.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not unblock this user.");
    },
  });

  return (
    <div className="p-2.5 sm:p-3.5 lg:p-4">
      <div className="container mx-auto max-w-5xl space-y-4">
        <div className="rounded-xl border border-base-300 bg-base-200/60 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-error/10 text-error">
              <BanIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Blocked Users</h1>
              <p className="text-sm opacity-70">People you have blocked will appear here.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
              <p className="font-medium">No blocked users</p>
              <p className="mt-1 text-sm opacity-70">Use the three-dot menu on a profile to block someone.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {blockedUsers.map((user) => (
                <div key={user._id} className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex items-start gap-3">
                      <div className="avatar shrink-0">
                        <div className="size-14 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">{user.fullName}</h3>
                          {user.active === false && (
                            <span className="badge badge-error badge-outline badge-sm">Deactivated</span>
                          )}
                        </div>
                        {user.username && (
                          <p className="truncate text-xs text-primary">@{user.username}</p>
                        )}
                        {user.location && (
                          <p className="mt-1 text-sm opacity-70">{user.location}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="badge badge-secondary h-auto px-2 py-1.5 text-[11px]">
                            {getLanguageFlag(user.nativeLanguage)}
                            Native: {capitalize(user.nativeLanguage)}
                          </span>
                          <span className="badge badge-outline h-auto px-2 py-1.5 text-[11px]">
                            {getLanguageFlag(user.learningLanguage)}
                            Learning: {capitalize(user.learningLanguage)}
                          </span>
                        </div>
                        {user.bio && (
                          <p className="mt-2 line-clamp-2 text-sm opacity-70">{user.bio}</p>
                        )}
                        <button
                          className="btn btn-outline btn-sm mt-3 w-full"
                          onClick={() => unblockUserMutation(user._id)}
                          disabled={isPending}
                        >
                          {isPending ? "Unblocking..." : "Unblock"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const capitalize = (value = "") => {
  if (!value) return "Not set";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default BlockedUsersPage;
