export type ServiceItem = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  offerings: string[];
  image: string;
  imageAlt: string;
};

export const services: ServiceItem[] = [
  {
    slug: "permanent-recruitment",
    title: "Permanent Recruitment",
    tagline: "Build teams that stay",
    summary:
      "We identify, assess and place permanent professionals across technical and business functions, matching proven capability with your culture and long-term goals.",
    offerings: [
      "Role definition and competency profiling",
      "Structured screening and skills assessment",
      "Shortlist delivery with interview coordination",
      "Offer management and onboarding support",
    ],
    image: "/images/service-recruitment.webp",
    imageAlt:
      "Recruiters reviewing candidate profiles together in a bright office meeting room",
  },
  {
    slug: "contract-staffing",
    title: "Contract & Temporary Staffing",
    tagline: "Scale capacity with confidence",
    summary:
      "Flexible contract and temporary workforce solutions that let you respond quickly to demand, cover peaks and specialist needs without long-term commitments.",
    offerings: [
      "Rapid shortlisting for urgent requirements",
      "Compliant contractor onboarding",
      "Timesheet and workforce administration support",
      "Contract extension and conversion pathways",
    ],
    image: "/images/service-staffing.webp",
    imageAlt:
      "Workers in safety equipment collaborating on a site walkway during a shift change",
  },
  {
    slug: "executive-search",
    title: "Executive & Leadership Search",
    tagline: "Leadership that moves organisations",
    summary:
      "Discreet, research-led search for senior and specialist leadership appointments, delivered with market mapping and rigorous, evidence-based assessment.",
    offerings: [
      "Market mapping and confidential outreach",
      "Structured leadership competency interviews",
      "Assessment reporting for hiring panels",
      "Remuneration benchmarking guidance",
    ],
    image: "/images/service-executive.webp",
    imageAlt:
      "Senior executives in discussion around a boardroom table with documents and laptops",
  },
  {
    slug: "workforce-consulting",
    title: "Workforce Consulting",
    tagline: "Turn workforce data into decisions",
    summary:
      "Advisory services spanning workforce planning, salary benchmarking and organisational design so your people strategy is grounded in real market evidence.",
    offerings: [
      "Workforce planning and demand forecasting",
      "Compensation and benefits benchmarking",
      "Organisational design and role architecture",
      "Talent pipeline and succession planning",
    ],
    image: "/images/service-consulting.webp",
    imageAlt:
      "Consultant presenting workforce analytics charts to a small group in a modern meeting space",
  },
  {
    slug: "managed-services",
    title: "Managed Services & RPO",
    tagline: "An extension of your hiring team",
    summary:
      "Recruitment process outsourcing and managed talent programmes that give you scalable sourcing capability, transparent reporting and predictable outcomes.",
    offerings: [
      "Embedded recruitment teams and sourcing",
      "Employer brand and candidate experience design",
      "SLA-driven delivery and reporting",
      "Technology-enabled pipeline management",
    ],
    image: "/images/service-managed.webp",
    imageAlt:
      "Talent acquisition team coordinating recruitment activity across multiple monitors",
  },
  {
    slug: "assessment-development",
    title: "Assessment & Talent Development",
    tagline: "Reveal and grow potential",
    summary:
      "Evidence-based assessment and development programmes that help you improve selection quality and invest in the people you already have.",
    offerings: [
      "Structured competency-based assessment",
      "Psychometric and technical evaluation",
      "Individual and team development plans",
      "Coaching for new and emerging leaders",
    ],
    image: "/images/service-assessment.webp",
    imageAlt:
      "Facilitator leading a professional development workshop with participants taking notes",
  },
];

export type IndustryItem = {
  slug: string;
  title: string;
  summary: string;
  roles: string[];
  image: string;
  imageAlt: string;
};

export const industries: IndustryItem[] = [
  {
    slug: "technology-digital",
    title: "Technology & Digital",
    summary:
      "Engineering, data, cloud, cybersecurity and product talent for organisations building and modernising digital platforms.",
    roles: ["Software Engineering", "Cloud & DevOps", "Data & Analytics", "Cybersecurity", "Product & Design"],
    image: "/images/industry-technology.webp",
    imageAlt: "Software engineers collaborating around dual monitors displaying code",
  },
  {
    slug: "engineering-manufacturing",
    title: "Engineering & Manufacturing",
    summary:
      "Technical and operational specialists for production, maintenance, quality and continuous improvement environments.",
    roles: ["Mechanical & Electrical", "Production & Operations", "Quality & Compliance", "Maintenance & Reliability", "Lean & CI"],
    image: "/images/industry-manufacturing.webp",
    imageAlt: "Technician operating precision machinery on a modern manufacturing floor",
  },
  {
    slug: "healthcare-life-sciences",
    title: "Healthcare & Life Sciences",
    summary:
      "Clinical, laboratory and health operations professionals supporting quality of care and research delivery.",
    roles: ["Clinical Operations", "Laboratory & Research", "Regulatory Affairs", "Health Informatics", "Care Management"],
    image: "/images/industry-healthcare.webp",
    imageAlt: "Healthcare professionals reviewing a patient chart in a bright clinical corridor",
  },
  {
    slug: "finance-professional-services",
    title: "Finance & Professional Services",
    summary:
      "Finance, risk, legal and consulting talent for regulated, analytical and client-facing functions.",
    roles: ["Accounting & Reporting", "Risk & Compliance", "Audit", "Corporate Finance", "Consulting"],
    image: "/images/industry-finance.webp",
    imageAlt: "Professionals reviewing financial reports and charts in a corporate office",
  },
  {
    slug: "logistics-supply-chain",
    title: "Logistics & Supply Chain",
    summary:
      "Warehousing, transport, planning and procurement specialists who keep goods and services moving reliably.",
    roles: ["Warehouse Operations", "Transport & Fleet", "Supply Planning", "Procurement", "Inventory Control"],
    image: "/images/industry-logistics.webp",
    imageAlt: "Logistics worker with a clipboard coordinating operations in a large warehouse",
  },
  {
    slug: "energy-infrastructure",
    title: "Energy & Infrastructure",
    summary:
      "Engineering and project talent for energy, utilities, construction and large-scale infrastructure programmes.",
    roles: ["Project Engineering", "Renewable Energy", "Utilities & Grid", "Construction Management", "Health & Safety"],
    image: "/images/industry-energy.webp",
    imageAlt: "Engineers in high-visibility clothing inspecting infrastructure at a power facility",
  },
];

export const servicesBySlug = new Map(services.map((s) => [s.slug, s]));
export const industriesBySlug = new Map(industries.map((i) => [i.slug, i]));

export const companyValues = [
  {
    title: "People first",
    description:
      "Behind every vacancy is a person and a team. We treat candidates and employers with the same respect we would expect for ourselves.",
  },
  {
    title: "Evidence over assumption",
    description:
      "We base recommendations on structured assessment, market evidence and clear criteria, not on impressions alone.",
  },
  {
    title: "Integrity in every process",
    description:
      "We are transparent about what we can deliver, how we work and how we handle personal information.",
  },
  {
    title: "Long-term partnership",
    description:
      "We measure success by the strength of the placements and relationships we build, not by activity alone.",
  },
];

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/jobs", label: "Jobs" },
  { href: "/employers", label: "Employers" },
  { href: "/candidates", label: "Candidates" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
] as const;
