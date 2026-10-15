# Image Sources & Verification Log

## Acquisition method

All images were downloaded once from the Unsplash CDN
(`images.unsplash.com`) via `scripts/acquire-images.sh` and stored locally as
optimised WebP under `public/images/`. The remote CDN is **not** referenced at
runtime.

## License

Unsplash License (https://unsplash.com/license) — free for commercial and
non-commercial use, no attribution required. Confirmed on the Unsplash license
page at acquisition time. Pexels was evaluated as an alternative but not used.

## Verification performed automatically

`npm run verify-images` validates every referenced asset:

| Check | Result |
|---|---|
| Valid image, allowed format (webp) | PASS (22/22) |
| Minimum dimensions (≥ 400×300) | PASS (min 1200×800) |
| Sane aspect ratio (0.4–3.2) | PASS |
| Not blank (pixel stddev ≥ 6) | PASS (min sd ≈ 30.7) |
| File size ≤ 1.5 MB | PASS (max ≈ 380 KB) |

## Verification NOT performed automatically — ACTION REQUIRED

> **Subject-matter / visual verification is pending.** The implementing agent
> could not open images (no image-input capability), so it could **not** confirm
> pixel-by-pixel that each photo matches its intended section. The assets were
> selected by documented search-and-subject metadata and validated for technical
> integrity only.
>
> A **contact sheet** was generated for fast human review:
> `node scripts/contact-sheet.cjs` → writes `/tmp/opencode/contact-sheet.jpg`.
> Please open it (or the files in `public/images/`) and confirm each tile matches
> the section described in `IMAGE-ASSET-PLAN.md`. Replace any mismatch and re-run
> `npm run verify-images`.

## Source identifiers (per asset)

| Local file | Unsplash CDN photo id | Intended subject | Subject review |
|---|---|---|---|
| `hero-workforce.webp` | `photo-1521737604893-d14cc237f11d` | Team collaborating | pending human check |
| `home-employers.webp` | `photo-1600880292203-757bb62b4baf` | Employer/hiring meeting | pending human check |
| `home-candidates.webp` | `photo-1573497019940-1c28c88b4f3e` | Professional at laptop | pending human check |
| `about-team.webp` | `photo-1522071820081-009f0129c71c` | Team in modern office | pending human check |
| `about-culture.webp` | `photo-1552664730-d307ca884978` | Collaborative meeting | pending human check |
| `service-recruitment.webp` | `photo-1542744173-8e7e53415bb0` | Recruiters reviewing profiles | pending human check |
| `service-staffing.webp` | `photo-1581092160562-40aa08e78837` | Site workforce / PPE | pending human check |
| `service-executive.webp` | `photo-1519085360753-af0119f7cbe7` | Executive / boardroom | pending human check |
| `service-consulting.webp` | `photo-1551288049-bebda4e38f71` | Analytics presentation | pending human check |
| `service-managed.webp` | `photo-1553877522-43269d4ea984` | Extended hiring team | pending human check |
| `service-assessment.webp` | `photo-1524178232363-1fb2b075b655` | Development workshop | pending human check |
| `industry-technology.webp` | `photo-1551434678-e076c223a692` | Software engineers | pending human check |
| `industry-manufacturing.webp` | `photo-1581091226825-a6a2a5aee158` | Precision machinery | pending human check |
| `industry-healthcare.webp` | `photo-1576091160399-112ba8d25d1d` | Clinical team | pending human check |
| `industry-finance.webp` | `photo-1454165804606-c3d57bc86b40` | Financial reports | pending human check |
| `industry-logistics.webp` | `photo-1553413077-190dd305871c` | Warehouse operations | pending human check |
| `industry-energy.webp` | `photo-1509391366360-2e959784a276` | Energy infrastructure | pending human check |
| `employers-hero.webp` | `photo-1521791136064-7986c2920216` | Handshake / partnership | pending human check |
| `candidates-hero.webp` | `photo-1498050108023-c5249f4df085` | Candidate at desk | pending human check |
| `insight-workforce-trends.webp` | `photo-1554224155-6726b3ff858f` | Editorial: trends | pending human check |
| `insight-hiring-process.webp` | `photo-1521791136064-7986c2920216` | Editorial: hiring | pending human check |
| `insight-retention.webp` | `photo-1543269865-cbf427effbad` | Editorial: retention | pending human check |

## Non-photographic assets

- Brand logo and all decorative graphics are original inline SVG
  (`src/components/brand/Logo.tsx`) — no third-party marks.
- Testimonials/reviews use initials avatars only; no stock portraits are attached
  to any testimonial or individual identity.
