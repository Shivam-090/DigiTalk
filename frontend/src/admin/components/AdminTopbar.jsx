import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { logout } from "../../lib/api";
import useAuthUser from "../../hooks/useAuthUser";

const AdminTopbar = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return (
    <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-3 sm:px-6">
      <div>
        <p className="text-sm opacity-60">Signed in as admin</p>
        <h2 className="font-semibold">{authUser?.fullName}</h2>
      </div>
      <button className="btn btn-outline btn-error btn-sm" onClick={logoutMutation} disabled={isPending}>
        <LogOutIcon className="size-4" />
        <span>{isPending ? "Logging out..." : "Logout"}</span>
      </button>
    </header>
  );
};

export default AdminTopbar;
