"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  email: string;
  initialProfile: {
    full_name: string;
    branch: string;
    year: string;
    whatsapp_number: string;
  };
};

export function ProfileForm({ email, initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [branch, setBranch] = useState(initialProfile.branch);
  const [year, setYear] = useState(initialProfile.year);
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile.whatsapp_number);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setErrorMsg("You must be logged in to update your profile.");
          return;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            branch: branch.trim() || null,
            year: year.trim() || null,
            whatsapp_number: whatsappNumber.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Profile update error:", error);
          setErrorMsg(error.message || "Failed to update profile details.");
        } else {
          setSuccessMsg("Profile updated successfully!");
          router.refresh();
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg ? (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-body">
          {errorMsg}
        </div>
      ) : null}

      {successMsg ? (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-body">
          {successMsg}
        </div>
      ) : null}

      <div className="space-y-1">
        <label className="block font-body text-caption font-semibold text-text-muted">
          Email Address
        </label>
        <input
          type="text"
          disabled
          value={email}
          className="w-full rounded-md border border-border bg-gray-100 px-3 py-2 text-body text-text-muted cursor-not-allowed"
        />
        <p className="font-body text-caption text-text-muted">
          Email is verified via Supabase Auth.
        </p>
      </div>

      <Input
        label="Full Name *"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="e.g. Alex Sharma"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Branch / Major"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="e.g. CSE, Mechanical, Economics"
        />

        <Input
          label="Academic Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g. 3rd Year, 2nd Year"
        />
      </div>

      <div className="space-y-1">
        <Input
          label="WhatsApp Contact Number"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="e.g. +91 9876543210"
        />
        <p className="font-body text-caption text-text-muted">
          Only revealed to verified students when they tap &apos;Contact Seller&apos;.
        </p>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving changes..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
