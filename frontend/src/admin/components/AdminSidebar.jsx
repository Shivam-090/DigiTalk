import { ShieldAlertIcon, UsersIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-full border-b border-base-300 bg-base-200 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-base-300 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Admin Panel</p>
        
      </div>

      <nav className="space-y-1 p-3">
        <Link
          to="/admin/manage-users"
          className={`btn btn-ghost btn-sm w-full justify-start gap-2.5 normal-case ${
            location.pathname === "/admin/manage-users" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-4" />
          <span>Manage Users</span>
        </Link>
        <Link
          to="/admin/view-reports"
          className={`btn btn-ghost btn-sm w-full justify-start gap-2.5 normal-case ${
            location.pathname === "/admin/view-reports" ? "btn-active" : ""
          }`}
        >
          <ShieldAlertIcon className="size-4" />
          <span>View Reports</span>
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
