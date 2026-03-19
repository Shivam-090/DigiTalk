import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BanIcon, MoreVerticalIcon, ShieldAlertIcon } from "lucide-react";
import toast from "react-hot-toast";
import { blockUser, reportUser } from "../lib/api";

const UserSafetyMenu = ({ user, hideBlock = false }) => {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const invalidateKeys = useMemo(
    () => [
      ["friends"],
      ["recommendedUsers"],
      ["blockedUsers"],
      ["friendRequests"],
      ["outgoingFriendReqs"],
    ],
    [],
  );

  const { mutate: blockUserMutation, isPending: isBlocking } = useMutation({
    mutationFn: () => blockUser(user._id),
    onSuccess: () => {
      invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      toast.success("User blocked successfully.");
      setBlockModalOpen(false);
      setMenuOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not block this user.");
    },
  });

  const { mutate: reportUserMutation, isPending: isReporting } = useMutation({
    mutationFn: () => reportUser(user._id, { reason }),
    onSuccess: () => {
      toast.success("Report submitted.");
      setReason("");
      setReportModalOpen(false);
      setMenuOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not submit the report.");
    },
  });

  return (
    <>
      <div className="relative">
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={`Open actions for ${user.fullName}`}
        >
          <MoreVerticalIcon className="size-4" />
        </button>

        {menuOpen && (
          <>
            <button
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setMenuOpen(false)}
              aria-label="Close user actions menu"
            />
            <div className="absolute right-0 top-10 z-20 w-44 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl">
              {!hideBlock && (
                <button
                  className="btn btn-ghost btn-sm w-full justify-start text-error"
                  onClick={() => {
                    setMenuOpen(false);
                    setBlockModalOpen(true);
                  }}
                >
                  <BanIcon className="size-4" />
                  Block
                </button>
              )}
              <button
                className="btn btn-ghost btn-sm w-full justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  setReportModalOpen(true);
                }}
              >
                <ShieldAlertIcon className="size-4" />
                Report
              </button>
            </div>
          </>
        )}
      </div>

      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm border border-base-300 bg-base-100 shadow-2xl">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Block user</h3>
              <p className="text-sm opacity-75">
                Do you really want to block <span className="font-medium">{user.fullName}</span>?
              </p>
              <div className="card-actions mt-2 justify-end">
                <button className="btn btn-ghost btn-sm" onClick={() => setBlockModalOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-error btn-sm" onClick={() => blockUserMutation()} disabled={isBlocking}>
                  {isBlocking ? "Blocking..." : "Block"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md border border-base-300 bg-base-100 shadow-2xl">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Report user</h3>
              <p className="text-sm opacity-75">
                Tell us why you are reporting <span className="font-medium">{user.fullName}</span>.
              </p>
              <textarea
                className="textarea textarea-bordered mt-2 min-h-28 w-full"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason of report"
                required
              />
              <div className="card-actions mt-2 justify-end">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setReportModalOpen(false);
                    setReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => reportUserMutation()}
                  disabled={isReporting || !reason.trim()}
                >
                  {isReporting ? "Sending..." : "Send report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSafetyMenu;
