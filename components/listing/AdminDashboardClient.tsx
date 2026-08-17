"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

type PendingListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  created_at: string;
  category: {
    name: string;
    slug: string;
  } | null;
  seller: {
    id: string;
    full_name: string;
    branch: string | null;
    year: string | null;
  } | null;
};

type PendingReport = {
  id: string;
  reason: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    slug: string;
  } | null;
  reporter: {
    id: string;
    full_name: string;
    branch: string | null;
    year: string | null;
  } | null;
};

type Profile = {
  id: string;
  full_name: string;
  branch: string | null;
  year: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
};

type AdminDashboardClientProps = {
  initialSettings: { approval_mode: string };
  initialPendingListings: PendingListing[];
  initialPendingReports: PendingReport[];
  initialProfiles: Profile[];
  currentUserId: string;
};

type TabType = "approvals" | "reports" | "users" | "settings";

export function AdminDashboardClient({
  initialSettings,
  initialPendingListings,
  initialPendingReports,
  initialProfiles,
  currentUserId,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("approvals");
  const [isPending, startTransition] = useTransition();

  // Local state for listings, reports, profiles, and settings
  const [pendingListings, setPendingListings] = useState<PendingListing[]>(initialPendingListings);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>(initialPendingReports);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [approvalMode, setApprovalMode] = useState<string>(initialSettings.approval_mode);
  
  // Search and error/success messaging states
  const [userSearch, setUserSearch] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "danger" } | null>(null);

  const triggerMessage = (text: string, type: "success" | "danger") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Sync state if props change
  const syncProps = () => {
    if (JSON.stringify(initialPendingListings) !== JSON.stringify(pendingListings)) {
      setPendingListings(initialPendingListings);
    }
    if (JSON.stringify(initialPendingReports) !== JSON.stringify(pendingReports)) {
      setPendingReports(initialPendingReports);
    }
    if (JSON.stringify(initialProfiles) !== JSON.stringify(profiles)) {
      setProfiles(initialProfiles);
    }
  };
  syncProps();

  // Settings: Save approval mode
  const handleSaveSettings = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approval_mode: approvalMode }),
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || "Failed to update settings.", "danger");
          return;
        }

        triggerMessage(`Marketplace settings saved: Mode set to ${approvalMode.toUpperCase()}`, "success");
        router.refresh();
      } catch (error) {
        console.error("Save settings error:", error);
        triggerMessage("Network error. Failed to update settings.", "danger");
      }
    });
  };

  // Approvals: Approve listing
  const handleApproveListing = (id: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/listings/${id}/approve`, {
          method: "PATCH",
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || "Failed to approve listing.", "danger");
          return;
        }

        setPendingListings(pendingListings.filter((l) => l.id !== id));
        triggerMessage("Listing approved successfully.", "success");
        router.refresh();
      } catch (error) {
        console.error("Approve listing error:", error);
        triggerMessage("Network error. Failed to approve listing.", "danger");
      }
    });
  };

  // Approvals: Reject listing
  const handleRejectListing = (id: string) => {
    const reason = rejectionReasons[id];
    if (!reason || reason.trim().length === 0) {
      triggerMessage("Rejection reason is required.", "danger");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/listings/${id}/reject`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || "Failed to reject listing.", "danger");
          return;
        }

        setPendingListings(pendingListings.filter((l) => l.id !== id));
        setActiveRejectId(null);
        triggerMessage("Listing rejected and seller notified.", "success");
        router.refresh();
      } catch (error) {
        console.error("Reject listing error:", error);
        triggerMessage("Network error. Failed to reject listing.", "danger");
      }
    });
  };

  // Reports: Resolve Report (Remove or Dismiss)
  const handleResolveReport = (id: string, action: "remove" | "dismiss") => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/reports/${id}/resolve`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || "Failed to resolve report.", "danger");
          return;
        }

        setPendingReports(pendingReports.filter((r) => r.id !== id));
        triggerMessage(
          action === "remove" ? "Report resolved: Listing removed." : "Report resolved: Flag dismissed.",
          "success"
        );
        router.refresh();
      } catch (error) {
        console.error("Resolve report error:", error);
        triggerMessage("Network error. Failed to resolve report.", "danger");
      }
    });
  };

  // Users: Ban / Unban user
  const handleToggleUserBan = (id: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${id}/${action}`, {
          method: "POST",
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || `Failed to ${action} user.`, "danger");
          return;
        }

        setProfiles(
          profiles.map((p) => (p.id === id ? { ...p, is_banned: !currentlyBanned } : p))
        );
        triggerMessage(`User profile was successfully ${action}ned.`, "success");
        router.refresh();
      } catch (error) {
        console.error(`${action} user error:`, error);
        triggerMessage(`Network error. Failed to ${action} user.`, "danger");
      }
    });
  };

  // Users: Promote to Admin
  const handlePromoteUser = (id: string) => {
    if (!confirm("Are you sure you want to promote this user to Admin? This action cannot be reversed.")) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${id}/promote`, {
          method: "POST",
        });

        const result = await response.json();
        if (!response.ok) {
          triggerMessage(result.error?.message || "Failed to promote user to admin.", "danger");
          return;
        }

        setProfiles(
          profiles.map((p) => (p.id === id ? { ...p, is_admin: true } : p))
        );
        triggerMessage("User promoted to Admin successfully.", "success");
        router.refresh();
      } catch (error) {
        console.error("Promote user error:", error);
        triggerMessage("Network error. Failed to promote user.", "danger");
      }
    });
  };

  // User Management search filter
  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Success/Error banner notifications */}
      {message && (
        <div
          className={`rounded-md border p-4 font-body text-caption shadow-sm ${
            message.type === "success"
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-danger/20 bg-danger/5 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admin Tab buttons */}
      <div className="border-b border-border">
        <div className="flex space-x-8 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`border-b-2 py-4 px-1 font-display text-body font-semibold whitespace-nowrap transition-colors outline-none ${
              activeTab === "approvals" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Approvals Queue{" "}
            <span
              className={`ml-1 text-caption font-normal font-body px-2 py-0.5 rounded-full ${
                activeTab === "approvals" ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"
              }`}
            >
              {pendingListings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`border-b-2 py-4 px-1 font-display text-body font-semibold whitespace-nowrap transition-colors outline-none ${
              activeTab === "reports" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            User Reports{" "}
            <span
              className={`ml-1 text-caption font-normal font-body px-2 py-0.5 rounded-full ${
                activeTab === "reports" ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"
              }`}
            >
              {pendingReports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`border-b-2 py-4 px-1 font-display text-body font-semibold whitespace-nowrap transition-colors outline-none ${
              activeTab === "users" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            User Administration
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`border-b-2 py-4 px-1 font-display text-body font-semibold whitespace-nowrap transition-colors outline-none ${
              activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Global Settings
          </button>
        </div>
      </div>

      {/* --- Tab Content: APPROVALS QUEUE --- */}
      {activeTab === "approvals" && (
        <div className="space-y-6">
          {pendingListings.length === 0 ? (
            <EmptyState
              title="Approvals queue is empty"
              description="No listings are currently pending moderation."
              className="py-16 bg-surface/50 border border-dashed rounded-lg border-border"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingListings.map((listing) => {
                const isRejecting = activeRejectId === listing.id;

                return (
                  <article
                    key={listing.id}
                    className="flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm"
                  >
                    {/* Listing Image */}
                    <div className="aspect-[4/3] w-full bg-background overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={listing.images[0] || "/placeholder-listing.png"}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-3 top-3">
                        <Badge variant="accent">₹{listing.price}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5 space-y-4">
                      {/* Listing Info */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-caption text-text-muted">
                            {listing.category?.name || "Other"}
                          </span>
                          <span className="font-body text-caption text-text-muted font-medium">
                            Condition: {listing.condition}
                          </span>
                        </div>
                        <h3 className="font-display text-body text-text font-semibold line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="font-body text-caption text-text-muted line-clamp-2">
                          {listing.description}
                        </p>
                      </div>

                      {/* Seller Identity block */}
                      <div className="bg-background rounded-md p-3 text-caption font-body text-text-muted">
                        <p className="font-semibold text-text mb-0.5">
                          Seller: {listing.seller?.full_name || "Student"}
                        </p>
                        {listing.seller?.branch || listing.seller?.year ? (
                          <p>
                            {listing.seller.branch}
                            {listing.seller.branch && listing.seller.year ? " • " : ""}
                            {listing.seller.year ? `${listing.seller.year} Year` : ""}
                          </p>
                        ) : null}
                      </div>

                      <hr className="border-border mt-auto" />

                      {/* Approvals Actions */}
                      {isRejecting ? (
                        <div className="space-y-3 pt-1">
                          <textarea
                            rows={3}
                            placeholder="Reason for rejection (mandatory)..."
                            value={rejectionReasons[listing.id] || ""}
                            onChange={(e) =>
                              setRejectionReasons({
                                ...rejectionReasons,
                                [listing.id]: e.target.value,
                              })
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 font-body text-caption text-text outline-none focus:border-danger resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="danger"
                              disabled={isPending}
                              onClick={() => handleRejectListing(listing.id)}
                              className="flex-1 font-semibold text-caption py-2"
                            >
                              Confirm Reject
                            </Button>
                            <button
                              type="button"
                              onClick={() => setActiveRejectId(null)}
                              className="px-4 py-2 border rounded-md border-border text-text font-body text-caption font-semibold hover:bg-background transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="primary"
                            disabled={isPending}
                            onClick={() => handleApproveListing(listing.id)}
                            className="flex-1 font-semibold text-caption py-2"
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            disabled={isPending}
                            onClick={() => setActiveRejectId(listing.id)}
                            className="flex-1 font-semibold text-caption py-2"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Tab Content: USER REPORTS --- */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {pendingReports.length === 0 ? (
            <EmptyState
              title="No reports pending resolution"
              description="Excellent! Listing compliance is 100% clean."
              className="py-16 bg-surface/50 border border-dashed rounded-lg border-border"
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-background text-caption font-body text-text font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Listing</th>
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-body text-body text-text">
                  {pendingReports.map((report) => (
                    <tr key={report.id} className="hover:bg-background/40 transition">
                      <td className="px-6 py-4">
                        {report.listing ? (
                          <a
                            href={`/listing/${report.listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            {report.listing.title}
                          </a>
                        ) : (
                          <span className="text-text-muted italic">Deleted Listing</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-body font-medium">
                          {report.reporter?.full_name || "Student"}
                        </div>
                        <div className="text-caption text-text-muted">
                          {report.reporter?.branch} {report.reporter?.year ? `• ${report.reporter.year} Year` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-danger/10 text-danger px-3 py-1 text-caption font-semibold">
                          {report.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-caption text-text-muted">
                        {new Date(report.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          type="button"
                          variant="danger"
                          disabled={isPending || !report.listing}
                          onClick={() => handleResolveReport(report.id, "remove")}
                          className="font-semibold text-caption py-1.5 px-3"
                        >
                          Remove Listing
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          disabled={isPending}
                          onClick={() => handleResolveReport(report.id, "dismiss")}
                          className="font-semibold text-caption py-1.5 px-3 bg-primary/20 text-primary border-transparent hover:bg-primary/30"
                        >
                          Dismiss Report
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Tab Content: USER ADMINISTRATION --- */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Search Input */}
          <div className="max-w-md">
            <Input
              id="user-search"
              label=""
              type="text"
              placeholder="Search user profile by name or ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {filteredProfiles.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No user profiles match your search criteria."
              className="py-16 bg-surface/50 border border-dashed rounded-lg border-border"
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-background text-caption font-body text-text font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status / Role</th>
                    <th className="px-6 py-4">Member Since</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-body text-body text-text">
                  {filteredProfiles.map((p) => {
                    const isSelf = p.id === currentUserId;

                    return (
                      <tr key={p.id} className="hover:bg-background/40 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text">{p.full_name}</div>
                          <div className="text-caption text-text-muted">
                            {p.branch} {p.year ? `• ${p.year} Year` : ""}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono select-all">
                            ID: {p.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex flex-wrap gap-2">
                            {p.is_admin ? (
                              <span className="inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold uppercase">
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-surface border text-text-muted px-3 py-1 text-[11px] font-semibold">
                                User
                              </span>
                            )}
                            {p.is_banned && (
                              <span className="inline-flex rounded-full bg-danger/10 text-danger px-3 py-1 text-[11px] font-bold uppercase">
                                Banned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-caption text-text-muted">
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {isSelf ? (
                            <span className="text-caption text-text-muted italic">
                              You (Current Session)
                            </span>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant={p.is_banned ? "primary" : "danger"}
                                disabled={isPending}
                                onClick={() => handleToggleUserBan(p.id, p.is_banned)}
                                className={`font-semibold text-caption py-1.5 px-3 ${
                                  p.is_banned ? "bg-primary/20 text-primary border-transparent hover:bg-primary/30" : ""
                                }`}
                              >
                                {p.is_banned ? "Unban User" : "Ban User"}
                              </Button>
                              {!p.is_admin && (
                                <Button
                                  type="button"
                                  variant="primary"
                                  disabled={isPending}
                                  onClick={() => handlePromoteUser(p.id)}
                                  className="font-semibold text-caption py-1.5 px-3"
                                >
                                  Promote to Admin
                                </Button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Tab Content: GLOBAL CONFIGURATION SETTINGS --- */}
      {activeTab === "settings" && (
        <section className="max-w-xl rounded-md border border-border bg-surface p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-heading text-text font-bold border-b pb-2">
              Marketplace settings
            </h2>
            <p className="font-body text-caption text-text-muted leading-relaxed">
              Configure listing moderation policies. These settings update dynamically without a redeploy.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-body font-semibold text-text">Listing Approval Mode</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer select-none p-2 rounded-md hover:bg-background transition">
                <input
                  type="radio"
                  name="approval-mode"
                  value="auto"
                  checked={approvalMode === "auto"}
                  onChange={(e) => setApprovalMode(e.target.value)}
                  className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer"
                />
                <div className="font-body text-body text-text">
                  <p className="font-semibold">Auto-Approve listings (Launch Default)</p>
                  <p className="text-caption text-text-muted">
                    New listings go live immediately on Browse. Moderation is done via flag reports.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none p-2 rounded-md hover:bg-background transition">
                <input
                  type="radio"
                  name="approval-mode"
                  value="manual"
                  checked={approvalMode === "manual"}
                  onChange={(e) => setApprovalMode(e.target.value)}
                  className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer"
                />
                <div className="font-body text-body text-text">
                  <p className="font-semibold">Manual Moderator Queue</p>
                  <p className="text-caption text-text-muted">
                    New listings are held as pending review and must be approved by an Admin to go live.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t flex justify-end">
            <Button
              type="button"
              variant="primary"
              disabled={isPending}
              onClick={handleSaveSettings}
              className="font-semibold text-caption"
            >
              Save Configuration
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
