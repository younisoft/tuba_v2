import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'product-audit');
const DIAGRAMS = path.join(OUT, 'diagrams');
const ASSETS = path.join(OUT, 'report-assets');
const TABLES = path.join(ASSETS, 'tables');
const CSV = path.join(ASSETS, 'csv');
const JSON_DIR = path.join(ASSETS, 'json');
const capture = JSON.parse(await readFile(path.join(ASSETS, 'capture.json'), 'utf8'));
const records = capture.records || [];
const by = (label) => records.find((r) => r.navLabel === label) || records.find((r) => (r.url || '').includes(label));
const dashboard = by('Overview') || records[0] || {};
const listings = by('My Listings') || {};
const leads = by('TruLeads') || {};
const settings = by('Settings') || {};

const observedDate = new Date(capture.capturedAt).toISOString().slice(0, 10);
const screenshots = records.filter((r) => r.screenshot).map((r) => ({
  area: r.navLabel || r.title || r.url,
  url: r.url,
  screenshot: r.screenshot,
  dialogs: r.dialogs || [],
}));

const scores = [
  ['UX', 7.2, 'Clear core flows and strong role focus, with weak hierarchy in dense tables.'],
  ['UI', 7.0, 'Professional Bayut design language, but repeated card/table density and low heading semantics.'],
  ['Performance', 6.6, 'SPA generally loads, but direct route refreshes intermittently produced Failed to fetch screens.'],
  ['Navigation', 7.1, 'Simple side rail; discoverability suffers because many navigation elements are buttons, not links.'],
  ['Search', 6.5, 'Useful ID and REGA filters, but limited saved searches, global search, or semantic search.'],
  ['Reporting', 6.7, 'Dashboard metrics exist; deeper report route was not reachable in this role/session.'],
  ['Analytics', 6.9, 'Good core KPI coverage: views, clicks, leads, calls, WhatsApp, SMS, email.'],
  ['Agent Experience', 7.4, 'Actionable profile completion, TruBroker prompts, and lead management are practical.'],
  ['Admin Experience', 6.8, 'Agency staff exists, but permission/role granularity was not deeply surfaced.'],
  ['Business Value', 8.0, 'Directly tied to listing quality, lead conversion, package monetization, and agency operations.'],
  ['Innovation', 5.9, 'Solid marketplace CRM basics, limited visible AI or predictive intelligence.'],
  ['Scalability', 6.9, 'Pagination and module separation are present; bulk and governance tooling look shallow.'],
  ['Accessibility', 5.8, 'Buttons without text/heading extraction gaps suggest semantic accessibility weaknesses.'],
  ['Overall Product Score', 7.0, 'A commercially useful real-estate SaaS console with room for workflow intelligence.'],
];

const featureRows = [
  ['Dashboard overview', 'Agency landing screen with profile status, listing totals, credits, performance KPIs, recent listings', 'Orient agency operators quickly', 'High', 'Medium', 'Yes', 'Add configurable widgets and trend explanations'],
  ['Profile completion', '90% completion prompt with TruBroker/profile improvement CTA', 'Improve trust and lead conversion', 'High', 'Low', 'Yes', 'Turn into checklist with exact missing fields and impact forecast'],
  ['Listings table', 'Active, Draft, Pending, Removed, Ad License Requests tabs; property, timeline, performance, status, upgrades, actions columns', 'Manage listing lifecycle', 'Very high', 'High', 'Yes', 'Add bulk actions, saved filters, and quality issue grouping'],
  ['Post listing', 'Choice between Sell/Rent Property and Daily Rentals', 'Create inventory', 'Very high', 'High', 'Yes', 'Wizard with completion autosave, REGA validation, media scoring'],
  ['Credits usage', 'Available/used/total credits, current plan, usage history by listing and upgrade', 'Monetization transparency', 'High', 'Medium', 'Yes', 'Forecast burn rate and recommend credit allocation'],
  ['TruLeads', 'Lead dashboard with status filters, trend buttons, add lead/task actions, lead table', 'Convert inquiries into deals', 'Very high', 'High', 'Yes', 'Pipeline board, lead scoring, SLA timers, duplicate merge'],
  ['Agency staff', 'Manage staff table for agency users', 'Operational administration', 'High', 'Medium', 'Yes', 'Expose roles, invite flow, audit log, per-feature permissions'],
  ['User settings', 'Profile/contact fields, language/support controls, modals', 'Maintain account identity and preferences', 'Medium', 'Medium', 'Yes', 'Separate personal, company, notification, security tabs'],
  ['Packages', 'Package selection page with business-needs positioning', 'Revenue and plan upgrades', 'High', 'Medium', 'Yes', 'Comparison matrix, ROI calculator, recommended package based on usage'],
  ['Language and support', 'Arabic toggle and Help & Support controls visible in shell', 'Localization and assistance', 'Medium', 'Low', 'Yes', 'Persistent contextual help and bilingual parity checks'],
];

function mdTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.map((v) => String(v).replaceAll('|', '\\|')).join(' | ')} |`),
  ].join('\n');
}

function pageBlock(r) {
  const text = r.text || '';
  const purpose = r.navLabel === 'Post Listing' ? 'Start property publishing workflow.' :
    r.navLabel === 'My Listings' ? 'Manage inventory and listing lifecycle.' :
    r.navLabel === 'Credits Usage' ? 'Track package balance and paid upgrade consumption.' :
    r.navLabel === 'TruLeads' ? 'Manage buyer/tenant inquiries and follow-up tasks.' :
    r.navLabel === 'Agency Staff' ? 'Administer agency users.' :
    r.navLabel === 'Settings' ? 'Maintain user profile and account preferences.' :
    r.navLabel === 'Credits & Packages' ? 'Select or upgrade paid packages.' :
    'Summarize agency performance and urgent actions.';
  return `### ${r.navLabel || r.title || r.url}

- URL: ${r.url || 'Not captured'}
- Screenshot: ${r.screenshot ? `../screenshots/${r.screenshot}` : 'Not available'}
- Purpose: ${purpose}
- Primary users: agency owner, listing manager, sales/lead agent, operations admin.
- Observed UI: ${(r.buttons || []).length} buttons, ${(r.inputs || []).length} inputs, ${(r.tables || []).length} tables, ${(r.dialogs || []).length} captured dialogs.
- Workflow: ${text.includes('Failed to fetch') ? 'Route discovered, but data fetch failed in this session.' : 'Enter from side navigation, review module data, filter/search or initiate primary action.'}
- Inputs: ${(r.inputs || []).map((i) => i.placeholder || i.name || i.type).filter(Boolean).join(', ') || 'No visible form inputs on first screen.'}
- Outputs: ${r.tables?.length ? `Table output with headers: ${r.tables[0].headers?.join(', ') || 'not exposed'}.` : 'Cards, KPIs, status messages, or package panels.'}
- UX score: ${text.includes('Failed to fetch') ? '4/10 due route/data failure' : r.navLabel === 'TruLeads' ? '7.5/10' : r.navLabel === 'Settings' ? '6.8/10' : '7/10'}
- Notes: ${text.slice(0, 700).replace(/\s+/g, ' ')}
`;
}

const files = {
  'README.md': `# Bayut Profolio Product Audit

Generated from a live authenticated audit capture on ${observedDate}. Credentials used for access are intentionally excluded.

## Contents

${Array.from({ length: 22 }, (_, i) => `${String(i + 1).padStart(2, '0')}_${[
  'EXECUTIVE_SUMMARY','PRODUCT_OVERVIEW','INFORMATION_ARCHITECTURE','PAGE_BY_PAGE_ANALYSIS','FEATURE_CATALOG','WORKFLOW_ANALYSIS','UX_REVIEW','UI_REVIEW','ANALYTICS_REVIEW','REPORTING_REVIEW','REAL_ESTATE_FEATURES','PERMISSIONS','TECHNICAL_OBSERVATIONS','STRENGTHS','WEAKNESSES','SWOT','COMPETITIVE_ANALYSIS','AI_OPPORTUNITIES','TUBA_RECOMMENDATIONS','IMPLEMENTATION_PRIORITY','FINAL_SCORECARD','SCREENSHOT_INDEX'
][i]}.md`).join('\n')}

Evidence lives in \`../screenshots/\`; structured capture data lives in \`report-assets/\`.

## Scope Note

Accessible modules captured: Overview, Post Listing, My Listings, Credits Usage, TruLeads, Agency Staff, User Settings, Credits & Packages. Agent Performance Reports was visible in navigation but did not resolve to a captured screen for this account/session.`,

  '01_EXECUTIVE_SUMMARY.md': `# Executive Summary

Bayut Profolio is a practical agency operations console centered on listing inventory, lead response, credits/packages, and staff/profile administration. The strongest commercial surfaces are the dashboard KPIs, the listings table, the credits ledger, and TruLeads. The product is visibly useful, but it behaves more like a marketplace back office than a modern intelligent CRM.

Key observations:

- The dashboard quickly communicates account health: profile completion, 12 active listings, 6,250 available credits, 1,675 views, 34 clicks, 3 leads, 2 calls, and 1 WhatsApp lead.
- Listing management is the operational core, with Active, Draft, Pending, Removed, and Ad License Requests states.
- TruLeads adds CRM-like lead and task actions but lacks visible lead scoring, automation, pipeline forecasting, and duplicate management.
- Credits/package monetization is clear enough for transparency, but lacks predictive burn-down or ROI guidance.
- The design is consistent and brand-aligned, though information density, accessibility semantics, and direct-route reliability are notable risks.

Overall score: **7.0/10**. Strong baseline SaaS utility; Tuba can beat it through workflow intelligence, better role governance, richer analytics, and AI-assisted listing/lead operations.`,

  '02_PRODUCT_OVERVIEW.md': `# Product Overview

Profolio serves agencies and agents who publish listings to Bayut, monitor listing performance, manage inquiries, consume paid credits, and administer staff/profile data.

Primary users:

- Agency owner: package spend, staff, overall performance.
- Listing manager: publishing, listing health, REGA/license data, upgrades.
- Sales agent: leads, tasks, follow-ups, calls, WhatsApp.
- Admin/operator: profile completion, staff maintenance, package/credits tracking.

Business goals:

- Increase quality and volume of published listings.
- Convert portal traffic into qualified leads.
- Drive adoption of paid boosts and packages.
- Improve agency trust through profile completion and TruBroker signals.
- Keep agencies returning through performance visibility.`,

  '03_INFORMATION_ARCHITECTURE.md': `# Information Architecture

\`\`\`text
Profolio
├── Overview
│   ├── Profile completion
│   ├── Listings summary
│   ├── Credits balance
│   ├── Performance KPIs
│   └── Recent listings
├── Post Listing
│   ├── Sell or Rent Property
│   └── Daily Rentals
├── My Listings
│   ├── Active
│   ├── Draft
│   ├── Pending
│   ├── Removed
│   └── Ad License Requests
├── Credits Usage
│   ├── Package status
│   ├── Usage breakdown
│   └── Credits usage history
├── TruLeads
│   ├── Lead metrics
│   ├── Lead filters
│   ├── Lead table
│   ├── Add New Lead
│   └── Tasks
├── Agent Performance Reports
│   └── Visible in nav; screen not captured
├── Agency Staff
│   └── Manage Staff
├── Settings
│   └── User Profile
└── Credits & Packages
    └── Packages
\`\`\`

See \`diagrams/site-map.mmd\` for the Mermaid sitemap.`,

  '04_PAGE_BY_PAGE_ANALYSIS.md': `# Page By Page Analysis

${records.map(pageBlock).join('\n')}`,

  '05_FEATURE_CATALOG.md': `# Feature Catalog

${mdTable(['Feature','Description','Purpose','Business Value','Complexity','Can Be Replicated','Improvement Suggestions'], featureRows)}`,

  '06_WORKFLOW_ANALYSIS.md': `# Workflow Analysis

## Listing Publishing

Observed entry: Post Listing. The first step asks the user to choose between Sell or Rent Property and Daily Rentals, then continue. This is a clear fork, but the first screen does not yet educate users about required documents, REGA license validation, media standards, or credit implications.

## Listing Management

Observed entry: My Listings. Users filter by Listing ID, REGA Ad License Number, Purpose, and Property Type; then act from a table with property, timeline, performance, status, upgrades, and actions. Lifecycle states include Active, Draft, Pending, Removed, and Ad License Requests.

## Lead Management

Observed entry: TruLeads. Users can view trend controls, filter/search, add a new lead, and add tasks. This is the most CRM-like workflow, but visible automation and prioritization are limited.

## Credits and Package Workflow

Observed entries: Credits Usage and Credits & Packages. Users can review available/used/total credits, inspect usage history, top up credits, and browse packages. The workflow is transparent but reactive.`,

  '07_UX_REVIEW.md': `# UX Review

Strengths:

- Side navigation is compact and role-oriented.
- Dashboard maps closely to agency questions: inventory, credits, performance, recent listings.
- Listing table combines operational state with performance metrics.
- TruLeads gives agents immediate next actions through Add New Lead and Add Task.

Weaknesses:

- Many navigation items are implemented as buttons rather than durable links, reducing browser affordances and crawlability.
- Tables are dense and can become difficult to scan without column controls, grouping, or saved views.
- Agent Performance Reports was visible but not captured, creating an IA expectation gap.
- Direct route refreshes intermittently produced a Failed to fetch screen during audit; that is a resilience concern.
- Modals/menus often expose broad side-menu text, suggesting overlay detection and focus management may be noisy.

Overall UX score: **7.2/10**.`,

  '08_UI_REVIEW.md': `# UI Review

The interface uses Bayut's teal-heavy brand system with restrained cards, tables, and simple status indicators. The product feels professional and enterprise-adjacent, but not yet best-in-class.

Findings:

- Typography is readable, but captured DOM exposed weak heading structure on several pages.
- Cards communicate numeric metrics clearly.
- Tables are functional, but high-density rows need stronger scan aids, sticky columns, and bulk controls.
- Buttons and CTAs are visually consistent; icon-only controls need stronger accessible labels.
- Bilingual affordances are visible through Arabic switching.
- No dark mode support was observed.

UI score: **7.0/10**.`,

  '09_ANALYTICS_REVIEW.md': `# Analytics Review

Observed KPIs:

- Views: 1,675
- Clicks: 34
- Leads: 3
- Calls: 2
- WhatsApp: 1
- SMS: 0
- Emails: 0
- Listing-level views, clicks, and leads
- Credit consumption by listing and upgrade type

Gaps:

- No visible conversion funnel from impression to lead to deal.
- No benchmark against comparable agencies/listings.
- No lead quality score or agent response-time metric.
- No visible predictive trend, anomaly detection, or recommended action layer.
- Agent Performance Reports was visible but not captured.`,

  '10_REPORTING_REVIEW.md': `# Reporting Review

Reporting exists primarily as dashboard metrics, listing-level performance columns, credits history, and TruLeads trend controls. The system provides operational reporting but limited management reporting.

Recommended reporting additions:

- Agency executive report: listing inventory, spend, leads, conversion, SLA.
- Agent report: assigned leads, response speed, contact attempts, conversion.
- Listing quality report: completeness, media quality, price competitiveness, REGA/license state.
- Credit ROI report: credit spend by boost type versus incremental lead output.
- Exportable scheduled reports in CSV/PDF.`,

  '11_REAL_ESTATE_FEATURES.md': `# Real Estate Features

Observed:

- Property lifecycle states: Active, Draft, Pending, Removed, Ad License Requests.
- Listing metadata: price, package tier, completion percentage, type, area, location, Bayut ID, REGA ID, post date.
- Publishing fork: Sell/Rent Property vs Daily Rentals.
- Upgrade types: Basic, Hot, Signature, Refresh, photography, videography, drone footage.
- Lead channels: calls, WhatsApp, SMS, email.
- Agency identity and staff management.
- Credits/package system.

Missing or not visible:

- Map/location editing workflow.
- Media library and image/video upload details.
- Approval/rejection reason workflow.
- Competitor pricing intelligence.
- Automated property valuation or pricing suggestions.
- Duplicate listing detection.`,

  '12_PERMISSIONS.md': `# Permissions

Observed permission signals:

- Agency Staff module is visible.
- User Settings module is visible.
- Logout is available.
- Staff management appears separated from personal profile settings.

Not visible in captured session:

- Role definitions.
- Fine-grained permissions.
- Invite/disable user workflow details.
- Audit log.
- Approval chains.

Recommendation: Tuba should model permissions explicitly around agency owner, admin, listing manager, agent, finance/package manager, and read-only analyst roles.`,

  '13_TECHNICAL_OBSERVATIONS.md': `# Technical Observations

Inferred architecture:

- Single-page application with authenticated API calls.
- Client-side routes include \`/en/dashboard\`, \`/en/post-listing\`, \`/en/listings\`, \`/en/credits-usage\`, \`/en/lms/leads\`, \`/en/agency-staff\`, \`/en/user-settings/user-profile\`, and \`/en/packages\`.
- Bot/CAPTCHA protection is active at Bayut account entry.
- Several navigation elements are client-side buttons rather than semantic anchors.
- Direct route refreshes intermittently showed \`TypeError: Failed to fetch\`, suggesting auth token refresh, API availability, CORS, or bot-protection coupling risks.
- Tables and pages appear API-driven; pagination is present on listings.

Security observations:

- CAPTCHA protection reduces automated abuse.
- Session and API handling should be tested for direct deep-link reliability.
- Role and permission surfaces need explicit auditability.`,

  '14_STRENGTHS.md': `# Strengths

- Strong marketplace fit: listings, credits, leads, and packages are tightly connected.
- Dashboard uses meaningful business KPIs instead of vanity-only stats.
- Listing table exposes operational and performance dimensions in one place.
- Credits history creates billing/spend transparency.
- TruLeads moves Profolio beyond listing management into conversion management.
- Bilingual and Saudi-market signals are present, including REGA license fields.
- Profile/TruBroker prompts encourage trust-building behaviors.`,

  '15_WEAKNESSES.md': `# Weaknesses

- Limited visible AI, recommendation, and automation capabilities.
- Dense tables without advanced view management.
- Direct route reliability issue observed during audit.
- Navigation semantics are weaker than modern SaaS norms.
- Reporting looks fragmented across dashboard, listings, credits, and leads.
- Permissions/roles are not clearly exposed from first-level screens.
- First step of listing creation misses a visible preparation checklist.`,

  '16_SWOT.md': `# SWOT

${mdTable(['Category','Items'], [
  ['Strengths','Marketplace-native workflows; listing performance; credits/package transparency; TruLeads; REGA-aware listing data.'],
  ['Weaknesses','Limited automation; dense UI; unclear permissions; weak deep-link resilience; limited visible reporting depth.'],
  ['Opportunities','AI listing quality, pricing suggestions, lead scoring, spend ROI, competitor insights, natural language search.'],
  ['Threats','Modern CRMs, agency-specific SaaS, Property Finder/Bayut UAE capabilities, user fatigue from manual operations.'],
])}`,

  '17_COMPETITIVE_ANALYSIS.md': `# Competitive Analysis

Compared with HubSpot/Salesforce, Profolio is more real-estate specific but far weaker in automation, pipeline configurability, permission governance, app ecosystem, and reporting depth.

Compared with Monday/ClickUp/Notion, Profolio is less flexible but better aligned to listing operations and marketplace monetization.

Compared with Property Finder, Bayut UAE, Zillow, and Airbnb Host Dashboard, Profolio has the right primitives: inventory, performance, lead channels, and boosts. The gap is intelligence: guidance on what to fix, where to spend, who to follow up with, and how performance compares to market benchmarks.`,

  '18_AI_OPPORTUNITIES.md': `# AI Opportunities

- Lead scoring based on channel, listing, response history, and engagement.
- Property description generation in Arabic and English.
- Image quality analysis: brightness, duplicate photos, room coverage, watermarking, blur.
- Duplicate listing detection across agency inventory.
- Pricing suggestions from neighborhood, property type, size, and competing listings.
- Smart credit recommendations: which listing should receive Hot/Signature/Refresh.
- Natural language search across listings, leads, credits, and staff.
- Smart notifications for stale leads, underperforming listings, and expiring licenses.
- Predictive analytics for expected views, clicks, and leads.
- Conversational assistant for agents and admins.`,

  '19_TUBA_RECOMMENDATIONS.md': `# What Tuba Should Build Better

${mdTable(['Feature','Bayut Implementation','Problems','Recommended Tuba Implementation','Priority'], [
  ['Dashboard','Static KPI cards and recent listings','Limited explanation and prioritization','Action dashboard with ranked fixes, trends, benchmarks, and next-best actions','P0'],
  ['Listings','Dense table with lifecycle tabs','Manual scanning, limited bulk intelligence','Saved views, bulk QA, AI quality score, license/media alerts','P0'],
  ['Post Listing','Simple listing type fork','No visible readiness guidance','Guided wizard with REGA validation, media checklist, autosave, AI description/pricing','P0'],
  ['TruLeads','Lead table, add lead/task, trend buttons','Weak visible scoring/automation','CRM pipeline with scoring, SLA timers, duplicate merge, WhatsApp/call timeline','P0'],
  ['Credits','Balance and usage history','No ROI forecast','Credit ROI planner and budget recommendations','P1'],
  ['Staff','Manage staff page','Permissions unclear','Role templates, audit log, invite/deactivate, team performance','P1'],
  ['Packages','Package browse page','Static buying experience','Usage-based recommendation and ROI calculator','P1'],
  ['Reports','Visible nav but not captured','Expectation gap','Unified report builder with scheduled exports','P1'],
])}`,

  '20_IMPLEMENTATION_PRIORITY.md': `# Implementation Priority

P0:

- Listing quality engine with REGA/media/completeness scoring.
- Lead pipeline with AI lead score and response SLA.
- Dashboard next-best-action feed.
- Robust search/filter/saved views for listings and leads.

P1:

- Credit ROI and package recommendation engine.
- Role-based staff permissions and audit log.
- Reporting builder with exports.
- Notification center and smart alerts.

P2:

- Competitor/market insights.
- Natural language assistant.
- Mobile-first agent workflows.
- Multi-branch agency analytics.`,

  '21_FINAL_SCORECARD.md': `# Final Scorecard

${mdTable(['Area','Score','Rationale'], scores)}`,

  '22_SCREENSHOT_INDEX.md': `# Screenshot Index

${mdTable(['Area','URL','Screenshot','Dialogs'], screenshots.map((s) => [s.area, s.url, `../screenshots/${s.screenshot}`, s.dialogs.map((d) => `${d.trigger}: ../screenshots/${d.screenshot}`).join('; ') || 'None']))}`,
};

await mkdir(OUT, { recursive: true });
await mkdir(DIAGRAMS, { recursive: true });
await mkdir(TABLES, { recursive: true });
await mkdir(CSV, { recursive: true });
await mkdir(JSON_DIR, { recursive: true });

for (const [file, body] of Object.entries(files)) {
  await writeFile(path.join(OUT, file), body.trim() + '\n');
}

await writeFile(path.join(DIAGRAMS, 'site-map.mmd'), `flowchart TD
  A[Profolio] --> B[Overview]
  A --> C[Post Listing]
  C --> C1[Sell or Rent Property]
  C --> C2[Daily Rentals]
  A --> D[My Listings]
  D --> D1[Active]
  D --> D2[Draft]
  D --> D3[Pending]
  D --> D4[Removed]
  D --> D5[Ad License Requests]
  A --> E[Credits Usage]
  E --> E1[Usage Breakdown]
  E --> E2[Credits Usage History]
  A --> F[TruLeads]
  F --> F1[Lead Filters]
  F --> F2[Lead Table]
  F --> F3[Tasks]
  A --> G[Agency Staff]
  A --> H[Settings]
  A --> I[Credits & Packages]
`);

await writeFile(path.join(DIAGRAMS, 'workflow.mmd'), `flowchart LR
  A[Create Listing] --> B[Choose Listing Type]
  B --> C[Enter Property Details]
  C --> D[REGA / License Validation]
  D --> E[Publish / Review]
  E --> F[Listing Live]
  F --> G[Views and Clicks]
  G --> H[Leads]
  H --> I[Tasks and Follow-up]
  F --> J[Credits / Upgrades]
  J --> G
`);

await writeFile(path.join(DIAGRAMS, 'permissions.mmd'), `flowchart TD
  Owner[Agency Owner] --> Admin[Admin]
  Admin --> Listings[Listing Manager]
  Admin --> Agents[Sales Agents]
  Admin --> Finance[Credits / Packages Manager]
  Admin --> Analyst[Read-only Analyst]
  Listings --> Publish[Create/Edit Listings]
  Agents --> Leads[Manage Leads/Tasks]
  Finance --> Spend[Top-up and Package Spend]
  Analyst --> Reports[View Reports]
`);

await writeFile(path.join(DIAGRAMS, 'feature-map.mmd'), `mindmap
  root((Profolio))
    Listings
      Post Listing
      Lifecycle Tabs
      REGA Fields
      Upgrades
    Leads
      TruLeads
      Tasks
      Channels
    Analytics
      Views
      Clicks
      Leads
      Calls
      WhatsApp
    Monetization
      Credits
      Packages
      Usage History
    Admin
      Staff
      Settings
      Profile Completion
`);

await writeFile(path.join(CSV, 'feature-catalog.csv'), [
  'Feature,Description,Purpose,Business Value,Complexity,Can Be Replicated,Improvement Suggestions',
  ...featureRows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')),
].join('\n'));

await writeFile(path.join(CSV, 'scorecard.csv'), [
  'Area,Score,Rationale',
  ...scores.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')),
].join('\n'));

await writeFile(path.join(JSON_DIR, 'feature-catalog.json'), JSON.stringify(featureRows.map((r) => ({
  feature: r[0], description: r[1], purpose: r[2], businessValue: r[3], complexity: r[4], canBeReplicated: r[5], improvementSuggestions: r[6],
})), null, 2));

await writeFile(path.join(JSON_DIR, 'scorecard.json'), JSON.stringify(scores.map((r) => ({
  area: r[0], score: r[1], rationale: r[2],
})), null, 2));

await writeFile(path.join(TABLES, 'observed-pages.md'), mdTable(['Nav Label','URL','Title','Screenshot','Buttons','Inputs','Tables','Dialogs'], records.map((r) => [
  r.navLabel || '',
  r.url || '',
  r.title || '',
  r.screenshot || '',
  (r.buttons || []).length,
  (r.inputs || []).length,
  (r.tables || []).length,
  (r.dialogs || []).length,
])));

console.log(`Generated ${Object.keys(files).length} markdown files plus diagrams and assets in ${OUT}`);
