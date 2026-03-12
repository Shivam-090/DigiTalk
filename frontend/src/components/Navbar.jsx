import { useQuery } from "@tanstack/react-query";
import { BellIcon, BellRingIcon, MenuIcon, ShipWheelIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { getFriendRequests } from "../lib/api";
import ThemeSelector from "./ThemeSelector";

const Navbar = ({ showSidebarToggle = false, onSidebarToggle }) => {
    const {authUser} = useAuthUser();
    const location = useLocation();
    const isChatPage = location.pathname?.startsWith("/chat");
    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendRequests,
        enabled: !!authUser,
    });
    const incomingFriendRequestCount = friendRequests?.incomingFriendRequests?.length || 0;
    const NotificationIcon = incomingFriendRequestCount > 0 ? BellRingIcon : BellIcon;
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end w-full gap-3">
                {showSidebarToggle && (
                    <button className="btn btn-ghost btn-circle lg:hidden" onClick={onSidebarToggle}>
                        <MenuIcon className="h-6 w-6 text-base-content opacity-80" />
                    </button>
                )}
                {isChatPage && (
                    <div className="pl-0 sm:pl-5">
                        <Link to="/" className="flex items-center gap-2.5">
                        <ShipWheelIcon className="size-9 text-primary" />
                        <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-wider'>
                            DigiTalk
                        </span>
                        </Link>
                    </div>
                )}

                <div className='flex items-center gap-3 sm:gap-4 ml-auto'>
                    <Link to={"/notifications"}>
                    <button className='btn btn-ghost btn-circle relative'>
                        <NotificationIcon className='h-6 w-6 text-base-content opacity-70' />
                        {incomingFriendRequestCount > 0 && (
                            <span className='badge badge-primary badge-sm absolute -right-1 -top-1 min-w-5'>
                                {incomingFriendRequestCount}
                            </span>
                        )}
                    </button>
                    </Link>
                </div>

                <ThemeSelector />

                <Link to="/profile" className="avatar transition-transform hover:scale-105">
                    <div className='w-9 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100'>
                        <img src={authUser?.profilePic} alt={authUser?.fullName} rel="noreferrer" />
                    </div>
                </Link>
             
            </div>

        </div>

    </nav>
  )
}

export default Navbar
