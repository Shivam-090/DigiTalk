import { useQuery } from "@tanstack/react-query";
import { ShieldAlertIcon } from "lucide-react";
import { getAdminReports } from "../lib/api";

const ViewReportsPage = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["adminReports"],
    queryFn: getAdminReports,
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border border-base-300 bg-base-200/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-error/10 text-error">
              <ShieldAlertIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">View Reports</h1>
              <p className="text-sm opacity-70">All submitted reports are listed here for review.</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center">
            <p className="font-semibold">No reports yet</p>
            <p className="mt-1 text-sm opacity-70">User reports will appear here once submitted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">Reporter</p>
                      <p className="mt-1 font-semibold">{report.reporter?.fullName || "Unknown user"}</p>
                      <p className="text-sm text-primary">@{report.reporter?.username || "unknown"}</p>
                      <p className="text-sm opacity-70">{report.reporter?.email || "No email"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">Reported User</p>
                      <p className="mt-1 font-semibold">{report.reportedUser?.fullName || "Unknown user"}</p>
                      <p className="text-sm text-primary">@{report.reportedUser?.username || "unknown"}</p>
                      <p className="text-sm opacity-70">{report.reportedUser?.email || "No email"}</p>
                    </div>
                  </div>
                  <span className={`badge ${report.reportedUser?.active === false ? "badge-error" : "badge-outline"}`}>
                    {report.reportedUser?.active === false ? "Reported user deactivated" : "Reported user active"}
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-base-200/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">Reason</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{report.reason}</p>
                </div>
                <p className="mt-3 text-xs opacity-60">
                  Submitted on {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReportsPage;
