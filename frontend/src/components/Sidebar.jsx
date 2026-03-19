import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router"
import useAuthUser from "../hooks/useAuthUser"
import { BanIcon, BellIcon, BellRingIcon, HomeIcon, LogOutIcon, ShipWheelIcon, UserIcon, XIcon } from "lucide-react";
import { getFriendRequests, logout } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Sidebar = ({ mobileOpen = false, onClose }) => {
    const {authUser} = useAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;
    const queryClient = useQueryClient();
    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendRequests,
        enabled: !!authUser,
    });
    const incomingFriendRequestCount = friendRequests?.incomingFriendRequests?.length || 0;
    const NotificationIcon = incomingFriendRequestCount > 0 ? BellRingIcon : BellIcon;

    const {mutate: logoutMutation, isPending} = useMutation({
        mutationFn: logout,
        onSuccess: ()=> queryClient.invalidateQueries({queryKey: ["authUser"]})
    })
  return (
    <>
    {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
    )}
    <aside className={`fixed inset-y-0 left-0 z-50 w-[17rem] bg-base-200 border-r border-base-300 flex flex-col h-screen transform transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:w-60 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <ShipWheelIcon className="size-7 text-primary" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-wider">DigiTalk</span>
            </Link>
            <button className="btn btn-ghost btn-circle btn-sm lg:hidden" onClick={onClose}>
                <XIcon className="size-5" />
            </button>
        </div>
        </div>

        <nav className="flex0-1 p-3 space-y-1">
            <Link to="/" onClick={onClose} className={`btn btn-ghost btn-sm justify-start w-full gap-2.5 normal-case ${currentPath === "/" ? "btn-active" : ""}`}>
                <HomeIcon className="size-4 text-base-content opacity-70" />
                <span>Home</span>
            </Link>
            <Link to="/add-friends" onClick={onClose} className={`btn btn-ghost btn-sm justify-start w-full gap-2.5 normal-case ${currentPath === "/add-friends" ? "btn-active" : ""}`}>
                <UserIcon className="size-4 text-base-content opacity-70" />
                <span>Discover People</span>
            </Link>
            <Link to="/notifications" onClick={onClose} className={`btn btn-ghost btn-sm justify-start w-full gap-2.5 normal-case ${currentPath === "/notifications" ? "btn-active" : ""}`}>
                <NotificationIcon className="size-4 text-base-content opacity-70" />
                <span>Notifications</span>
                {incomingFriendRequestCount > 0 && (
                    <span className="badge badge-primary badge-sm ml-auto">
                        {incomingFriendRequestCount}
                    </span>
                )}
            </Link>
            <Link to="/blocked-users" onClick={onClose} className={`btn btn-ghost btn-sm justify-start w-full gap-2.5 normal-case ${currentPath === "/blocked-users" ? "btn-active" : ""}`}>
                <BanIcon className="size-4 text-base-content opacity-70" />
                <span>Blocked</span>
            </Link>
        </nav>

        <div className="p-3 border-t border-base-300 mt-auto">
            <div className='flex items-center gap-2.5'>
                <div className='avatar'>
                    <div className='w-9 rounded-full'>
                        <img src={authUser?.profilePic} alt="User Avatar" />
                    </div>
                </div>

                <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-sm'>{authUser?.fullName}</p>
                    <p className='truncate text-sm opacity-70'>
                        {authUser?.username ? `@${authUser.username}` : authUser?.email}
                    </p>
                </div>
            </div>

            <button
              className="btn btn-outline btn-error btn-sm mt-3 w-full justify-start"
              onClick={logoutMutation}
              disabled={isPending}
            >
              <LogOutIcon className="size-4" />
              <span>{isPending ? "Logging out..." : "Logout"}</span>
            </button>

        </div>
    </aside>
    </>
  )
}

export default Sidebar
