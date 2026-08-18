"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";

type ContactSellerButtonProps = {
  listingId: string;
  initialState: "guest" | "unverified" | "ready" | "rate-limited" | "no-contact-available";
  listingSlug: string;
};

export function ContactSellerButton({
  listingId,
  initialState,
  listingSlug,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentState, setCurrentState] = useState(initialState);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContactClick = () => {
    if (currentState === "guest") {
      router.push(`/login?returnTo=${encodeURIComponent(`/listing/${listingSlug}`)}`);
      return;
    }

    if (currentState === "ready") {
      startTransition(async () => {
        try {
          setErrorMsg(null);
          const response = await fetch(`/api/listings/${listingId}/contact`, {
            method: "POST",
          });
          const result = await response.json();

          if (!response.ok) {
            const message = result.error?.message || "Failed to reveal contact.";
            setErrorMsg(message);

            if (response.status === 429) {
              setCurrentState("rate-limited");
            } else if (response.status === 403 && message.includes("Verify your email")) {
              setCurrentState("unverified");
            } else if (response.status === 404 && message.includes("contact not available")) {
              setCurrentState("no-contact-available");
            }
            return;
          }

          const { waLink } = result.data;
          if (waLink) {
            window.open(waLink, "_blank", "noopener,noreferrer");
          } else {
            setErrorMsg("WhatsApp link not returned by server.");
          }
        } catch (error) {
          console.error("Error contacting seller:", error);
          setErrorMsg("Connection error. Could not contact server.");
        }
      });
    }
  };

  // Render different visual styles depending on state
  switch (currentState) {
    case "guest":
      return (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleContactClick}
            className="w-full font-semibold"
          >
            Sign in to reveal contact
          </Button>
          <p className="font-body text-caption text-text-muted text-center">
            Sign in with your student account to contact the seller.
          </p>
        </div>
      );

    case "unverified":
      return (
        <div className="space-y-2">
          <Button
            type="button"
            disabled
            className="w-full font-semibold opacity-60 cursor-not-allowed"
          >
            Verify email to contact
          </Button>
          <p className="font-body text-caption text-danger text-center">
            Verify your email to contact sellers.
          </p>
        </div>
      );

    case "rate-limited":
      return (
        <div className="space-y-2">
          <Button
            type="button"
            disabled
            className="w-full font-semibold opacity-60 cursor-not-allowed"
          >
            Contact Seller (WhatsApp)
          </Button>
          <p className="font-body text-caption text-danger text-center font-medium">
            Daily limit reached. Try again tomorrow.
          </p>
        </div>
      );

    case "no-contact-available":
      return (
        <div className="space-y-2">
          <Button
            type="button"
            disabled
            variant="secondary"
            className="w-full font-semibold opacity-50 cursor-not-allowed"
          >
            Contact Seller (WhatsApp)
          </Button>
          <p className="font-body text-caption text-text-muted text-center italic">
            This seller hasn&apos;t added a WhatsApp number yet.
          </p>
        </div>
      );

    case "ready":
    default:
      return (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleContactClick}
            isLoading={isPending}
            className="w-full font-semibold"
          >
            Contact Seller (WhatsApp)
          </Button>
          {errorMsg ? (
            <p className="font-body text-caption text-danger text-center">{errorMsg}</p>
          ) : (
            <p className="font-body text-caption text-text-muted text-center">
              Contact revealed only to verified students
            </p>
          )}
        </div>
      );
  }
}
