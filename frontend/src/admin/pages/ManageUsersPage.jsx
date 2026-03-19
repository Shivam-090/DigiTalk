import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminUsers, updateAdminUserActiveStatus } from "../lib/api";

const ManageUsersPage = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAdminUsers,
  });

  const { mutate: updateStatusMutation, isPending } = useMutation({
    mutationFn: ({ userId, active }) => updateAdminUserActiveStatus(userId, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(data?.message || "User status updated.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not update user status.");
    },
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
       

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Onboarding</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="size-11 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{user.fullName}</div>
                            <div className="text-xs text-primary">@{user.username || "no_username"}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.isAdmin ? (
                          <span className="badge badge-secondary">
                            <ShieldCheckIcon className="size-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="badge badge-outline">User</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${user.isOnboarded ? "badge-success" : "badge-ghost"}`}>
                          {user.isOnboarded ? "Complete" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.active === false ? "badge-error" : "badge-success"}`}>
                          {user.active === false ? "Deactivated" : "Active"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${user.active === false ? "btn-success" : "btn-error"}`}
                          disabled={isPending || user.isAdmin}
                          onClick={() =>
                            updateStatusMutation({
                              userId: user._id,
                              active: user.active === false,
                            })
                          }
                        >
                          {user.active === false ? "Activate" : "Deactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
