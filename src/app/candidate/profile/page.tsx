import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download } from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getAuthContext, findCandidateProfile } from "@/lib/auth/session";
import { ProfileForm } from "./ProfileForm";
import { ResumeUploader } from "./ResumeUploader";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile & CV" };
export const dynamic = "force-dynamic";

export default async function CandidateProfilePage() {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  const profile = await findCandidateProfile(ctx.user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-900">Profile & CV</h1>
        <p className="mt-1 text-sm text-slate-600">
          Keep your profile up to date to improve your chances with employers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your CV</CardTitle>
        </CardHeader>
        <CardBody>
          {profile.resumeDocumentId ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2.5 text-sm text-emerald-900">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold">CV on file</span>
                <span className="text-emerald-700">
                  Updated {formatDateTime(profile.updatedAt)}
                </span>
              </div>
              <Link
                href={`/api/documents/${profile.resumeDocumentId}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Link>
            </div>
          ) : (
            <p className="mb-5 text-sm text-slate-600">
              You have not uploaded a CV yet. A CV is required before you can apply
              for a role.
            </p>
          )}
          <ResumeUploader hasResume={Boolean(profile.resumeDocumentId)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardBody>
          <ProfileForm
            defaults={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: profile.phone ?? "",
              headline: profile.headline ?? "",
              summary: profile.summary ?? "",
              location: profile.location ?? "",
              country: profile.country ?? "",
              linkedinUrl: profile.linkedinUrl ?? "",
              skills: (profile.skills ?? []).join(", "),
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
