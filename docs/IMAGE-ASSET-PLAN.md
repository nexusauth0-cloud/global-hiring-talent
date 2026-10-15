# Image Asset Plan — Global Hiring Talent

This document is the single source of truth for every image used in the product.
It is maintained as the implementation evolves. Status values:

`planned` → `downloaded` → `inspected` → `integrated` → `verified`

Nothing is integrated until it has been **visually inspected** (opened and
confirmed to match the section subject) and its **license** recorded.

## Sources and licensing

- **Unsplash** (`images.unsplash.com`): assets are used under the
  [Unsplash License](https://unsplash.com/license) — free for commercial and
  non-commercial use, no permission or attribution required (attribution
  appreciated). Each asset's terms were checked on its photo page.
- **Pexels** (`images.pexels.com`): assets are used under the
  [Pexels License](https://www.pexels.com/license/) — free to use, no
  attribution required.
- No ManpowerGroup imagery is used. No protected/watermarked sources are used.
- Local, optimised WebP is served in production; the remote CDN is only the
  acquisition source and is not referenced at runtime.

## Inventory

| Asset ID | Page / Section | Purpose & subject | Composition | Ratio | Alt text | Source | License | Local path | Status |
|---|---|---|---|---|---|---|---|---|---|
| IMG-001 | `/` hero | Diverse professionals collaborating | Wide, people mid-frame, copy-safe left | 16:9 (1920×1080) | See component | Unsplash | Unsplash License | `public/images/hero-workforce.webp` | integrated |
| IMG-002 | `/` employers CTA | Employer/hiring discussion | Two people, handshake/meeting | 4:3 | See component | Unsplash | Unsplash License | `public/images/home-employers.webp` | integrated |
| IMG-003 | `/` candidates CTA | Professional at laptop | Individual, natural light | 4:3 | See component | Unsplash | Unsplash License | `public/images/home-candidates.webp` | integrated |
| IMG-004 | `/about` | Team culture / workplace | Group in modern office | 16:9 | See component | Unsplash | Unsplash License | `public/images/about-team.webp` | integrated |
| IMG-005 | `/about` values | Collaborative meeting | Small group, table | 4:3 | See component | Unsplash | Unsplash License | `public/images/about-culture.webp` | integrated |
| IMG-010 | `/services` permanent recruitment | Recruiters reviewing profiles | Office meeting | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-recruitment.webp` | integrated |
| IMG-011 | `/services` contract staffing | Site workforce | Workers in PPE | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-staffing.webp` | integrated |
| IMG-012 | `/services` executive search | Boardroom discussion | Executives, table | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-executive.webp` | integrated |
| IMG-013 | `/services` workforce consulting | Analytics presentation | Charts/screen | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-consulting.webp` | integrated |
| IMG-014 | `/services` managed services | Extended hiring team | Multiple monitors | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-managed.webp` | integrated |
| IMG-015 | `/services` assessment | Development workshop | Facilitator + group | 3:2 | See component | Unsplash | Unsplash License | `public/images/service-assessment.webp` | integrated |
| IMG-020 | `/industries` technology | Software engineers | Screens/code | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-technology.webp` | integrated |
| IMG-021 | `/industries` manufacturing | Precision machinery | Technician at machine | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-manufacturing.webp` | integrated |
| IMG-022 | `/industries` healthcare | Clinical team | Chart review | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-healthcare.webp` | integrated |
| IMG-023 | `/industries` finance | Financial reports | Charts/documents | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-finance.webp` | integrated |
| IMG-024 | `/industries` logistics | Warehouse operations | Clipboard/warehouse | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-logistics.webp` | integrated |
| IMG-025 | `/industries` energy | Infrastructure inspection | Engineers, facility | 3:2 | See component | Unsplash | Unsplash License | `public/images/industry-energy.webp` | integrated |
| IMG-030 | `/employers` | Partnership/handshake | 16:9 | See component | Unsplash | Unsplash License | `public/images/employers-hero.webp` | integrated |
| IMG-031 | `/candidates` | Candidate at desk | 16:9 | See component | Unsplash | Unsplash License | `public/images/candidates-hero.webp` | integrated |
| IMG-040 | Insights: workforce trends | Editorial cover | 16:9 | See component | Unsplash | Unsplash License | `public/images/insight-workforce-trends.webp` | integrated |
| IMG-041 | Insights: hiring process | Editorial cover | 16:9 | See component | Unsplash | Unsplash License | `public/images/insight-hiring-process.webp` | integrated |
| IMG-042 | Insights: retention | Editorial cover | 16:9 | See component | Unsplash | Unsplash License | `public/images/insight-retention.webp` | integrated |

> Exact source photo page URLs, authors and license checks per asset are recorded
> in `docs/IMAGE-SOURCES.md`, generated during acquisition.

## Acquisition log

See `docs/IMAGE-SOURCES.md`. All assets above were **downloaded and visually
inspected** during implementation (see that log for per-asset source IDs).

## Policy reminders

- No stock photo is attached to a fabricated person, client, testimonial or
  partnership. Testimonials are only rendered from **approved, genuine** reviews
  stored in the database.
- If a required image cannot be acquired, the section uses a deliberate branded
  SVG/CSS composition and the gap is recorded here — never an unrelated photo.
