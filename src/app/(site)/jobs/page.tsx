import type { Metadata } from "next";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Label, Select } from "@/components/ui/Field";
import { listPublishedJobs, getJobFilterOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Job board",
  description:
    "Browse current job opportunities published by approved organisations on Global Hiring Talent.",
};

type SearchParams = {
  q?: string;
  location?: string;
  employmentType?: string;
  industry?: string;
  department?: string;
  sort?: string;
  page?: string;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const [{ jobs, total, totalPages, pageSize }, filterOptions] = await Promise.all([
    listPublishedJobs({
      q: sp.q?.trim(),
      location: sp.location?.trim(),
      employmentType: sp.employmentType,
      industry: sp.industry,
      department: sp.department,
      sort: sp.sort,
      page,
      pageSize: 10,
    }),
    getJobFilterOptions(),
  ]);

  const hasFilters = Boolean(
    sp.q || sp.location || sp.employmentType || sp.industry || sp.department
  );

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.location) params.set("location", sp.location);
    if (sp.employmentType) params.set("employmentType", sp.employmentType);
    if (sp.industry) params.set("industry", sp.industry);
    if (sp.department) params.set("department", sp.department);
    if (sp.sort) params.set("sort", sp.sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <>
      <PageHero
        eyebrow="Job board"
        title="Find your next opportunity"
        intro="Browse genuine vacancies published by approved organisations. Use the filters to narrow your search by location, work type and industry."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[20rem_1fr] lg:gap-12">
        {/* Filters */}
        <aside aria-label="Job filters" className="lg:sticky lg:top-24 lg:self-start">
          <form method="get" action="/jobs" className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-sm font-bold text-brand-900">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filter jobs
            </h2>

            <div className="mt-5 space-y-4">
              <Field className="mb-0">
                <Label htmlFor="q">Keyword</Label>
                <Input
                  id="q"
                  name="q"
                  defaultValue={sp.q ?? ""}
                  placeholder="Title, skill or company"
                />
              </Field>

              <Field className="mb-0">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={sp.location ?? ""}
                  placeholder="City or country"
                />
              </Field>

              <Field className="mb-0">
                <Label htmlFor="employmentType">Work type</Label>
                <Select
                  id="employmentType"
                  name="employmentType"
                  defaultValue={sp.employmentType ?? ""}
                >
                  <option value="">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </Select>
              </Field>

              {filterOptions.industries.length > 0 && (
                <Field className="mb-0">
                  <Label htmlFor="industry">Industry</Label>
                  <Select id="industry" name="industry" defaultValue={sp.industry ?? ""}>
                    <option value="">Any</option>
                    {filterOptions.industries.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {filterOptions.departments.length > 0 && (
                <Field className="mb-0">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    id="department"
                    name="department"
                    defaultValue={sp.department ?? ""}
                  >
                    <option value="">Any</option>
                    {filterOptions.departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <Field className="mb-0">
                <Label htmlFor="sort">Sort by</Label>
                <Select id="sort" name="sort" defaultValue={sp.sort ?? "newest"}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title (A–Z)</option>
                </Select>
              </Field>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Button type="submit" className="w-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                Apply filters
              </Button>
              {hasFilters && (
                <ButtonLink href="/jobs" variant="ghost" className="w-full">
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </ButtonLink>
              )}
            </div>
          </form>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-600" role="status" aria-live="polite">
              {total === 0
                ? "No jobs found"
                : `Showing ${start}–${end} of ${total} job${total === 1 ? "" : "s"}`}
            </p>
          </div>

          {jobs.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildHref}
                className="mt-10"
              />
            </>
          ) : (
            <EmptyState
              icon={<Search className="h-8 w-8" aria-hidden="true" />}
              title={hasFilters ? "No jobs match your filters" : "No jobs are currently open"}
              description={
                hasFilters
                  ? "Try adjusting or clearing your filters to see more opportunities."
                  : "There are no published vacancies at the moment. New roles will appear here as soon as approved organisations post them."
              }
              action={
                hasFilters ? (
                  <ButtonLink href="/jobs" variant="outline">
                    Clear filters
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/contact" variant="primary">
                    Submit a speculative enquiry
                  </ButtonLink>
                )
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
