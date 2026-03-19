import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, MapPinIcon, SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../lib/api";
import { getLanguageFlag } from "../lib/language.jsx";
import UserSafetyMenu from "../components/UserSafetyMenu.jsx";

const AddFriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const { data: recommendedUsers = [], isLoading } = useQuery({
    queryKey: ["recommendedUsers", deferredSearchTerm],
    queryFn: () => getRecommendedUsers(deferredSearchTerm),
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      toast.success("Friend request sent.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not send friend request.");
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();

    if (outgoingFriendReqs?.length) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
    }

    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  return (
    <div className="p-2.5 sm:p-3.5 lg:p-3">
      <div className="container mx-auto space-y-4">
        

        <div className="rounded-xl border border-base-300 bg-base-200/60 p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UsersIcon className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Add Friends</h2>
                <p className="text-sm opacity-70">Find language partners by username.</p>
              </div>
            </div>

            <label className="input input-bordered input-sm flex w-full items-center gap-2 lg:max-w-xs">
              <SearchIcon className="size-4 opacity-70" />
              <input
                type="text"
                className="grow"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
            </label>
          </div>

          {deferredSearchTerm && (
            <p className="mb-3 text-sm opacity-70">
              Showing results for <span className="font-medium text-primary">@{deferredSearchTerm}</span>
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-100 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No users found</h3>
              <p className="text-base-content opacity-70">
                {deferredSearchTerm
                  ? "No matching username was found in the available users."
                  : "There are no recommended people to add right now."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-100 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="card-body gap-3 p-3.5 sm:p-4">
                      <div className="flex min-w-0 flex-1 items-start gap-3 overflow-hidden">
                        <div className="avatar shrink-0">
                          <div className="size-14 rounded-full">
                            <img src={user.profilePic} alt={user.fullName} />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-base">{user.fullName}</h3>
                            {user.active === false && (
                              <span className="badge badge-error badge-outline badge-sm">Deactivated</span>
                            )}
                          </div>
                          {user.username && (
                            <p className="truncate text-xs text-primary">@{user.username}</p>
                          )}
                          {user.location && (
                            <div className="mt-1 flex min-w-0 items-center text-xs opacity-70">
                              <MapPinIcon className="mr-1 size-3 shrink-0" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="badge badge-secondary h-auto max-w-full whitespace-normal px-2 py-1.5 text-left text-[11px]">
                              {getLanguageFlag(user.nativeLanguage)}
                              Native: {capitalize(user.nativeLanguage)}
                            </span>

                            <span className="badge badge-secondary h-auto max-w-full whitespace-normal px-2 py-1.5 text-left text-[11px]">
                              {getLanguageFlag(user.learningLanguage)}
                              Learning: {capitalize(user.learningLanguage)}
                            </span>
                          </div>

                          {user.bio && (
                            <p className="mt-2 line-clamp-2 break-words text-sm opacity-70">{user.bio}</p>
                          )}
                        </div>
                        <UserSafetyMenu user={user} />
                      </div>

                      <button
                        className={`btn btn-sm mt-0.5 w-full ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                        disabled={hasRequestBeenSent || isPending || user.active === false}
                        onClick={() => sendRequestMutation(user._id)}
                      >
                        {user.active === false ? (
                          "Profile Deactivated"
                        ) : hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendsPage;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
