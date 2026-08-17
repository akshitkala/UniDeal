"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

type ReportDialogProps = {
  listingId: string;
};

const ALLOWED_REASONS = [
  "Fake listing",
  "Prohibited item",
  "Misleading price",
  "Spam",
  "Other"
];

export function ReportDialog({ listingId }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setReason("");
    setMessage(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setErrorMsg("Please select a reason.");
      return;
    }

    setErrorMsg(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        });

        const result = await response.json();

        if (!response.ok) {
          setErrorMsg(result.error?.message || "Failed to submit report.");
          return;
        }

        setMessage("Thank you! This listing has been reported and will be reviewed by an admin.");
        
        // Auto-close modal after 2.5 seconds on success
        setTimeout(() => {
          setIsOpen(false);
        }, 2500);
      } catch (error) {
        console.error("Error reporting listing:", error);
        setErrorMsg("Connection error. Could not contact the server.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="font-body text-caption font-semibold text-danger hover:underline transition"
      >
        Report listing
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-display text-heading text-text font-bold">
                Report Listing
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-text-muted hover:text-text font-semibold p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {message ? (
              <div className="space-y-4 py-2">
                <p className="font-body text-body text-primary font-medium text-center">
                  {message}
                </p>
                <div className="flex justify-end">
                  <Button type="button" onClick={handleClose} className="font-semibold">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="font-body text-body text-text-muted">
                  Select a reason for reporting this listing:
                </p>

                <div className="space-y-3">
                  {ALLOWED_REASONS.map((r) => (
                    <label
                      key={r}
                      className="flex items-center space-x-3 cursor-pointer select-none p-2 rounded-md hover:bg-background transition-colors"
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer"
                      />
                      <span className="font-body text-body text-text">{r}</span>
                    </label>
                  ))}
                </div>

                {errorMsg && (
                  <p className="font-body text-caption text-danger border border-danger/10 bg-danger/5 rounded-md px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="font-body text-caption font-semibold px-4 py-2 border rounded-md border-border text-text hover:bg-background transition"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="danger"
                    isLoading={isPending}
                    className="font-semibold"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
