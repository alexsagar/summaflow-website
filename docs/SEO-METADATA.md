# SEO Metadata Reference

Launch reference for titles, descriptions, keyword themes, H1s, index state, schema, and implementation type.

Visible website copy is locked. Nothing in this document is to be inserted into page copy. Keyword themes are for planning only; there is no `<meta name="keywords">` tag and none should be added.

Staging (`summaflow-redesign-test.odoo.com`) stays blocked and noindex. Index state below applies to production (`https://summaflow.com`) only.

**Implementation types**
- **Source-controlled**: set in this module (`website_meta_title`, `website_meta_description`, `website_indexed` on `website.page` records, or QWeb). Ships with module import.
- **Manual Odoo Builder**: set in Odoo Website Builder, page SEO dialog (Site → Optimize SEO). These pages are database content with no module record to write to.

## Page map

Site-wide schema on every page: `Organization`, `WebSite`, `SoftwareApplication` (module, `views/seo.xml`) plus Odoo's native `Organization` block. The Schema column lists only what a page adds on top of that.

| Page | URL | Primary Keyword Theme | Secondary Themes | SEO Title | Meta Description | H1 | Index State | Schema | Implementation Type |
|---|---|---|---|---|---|---|---|---|---|
| Home | `/` | AI operations intelligence for global trade | operational visibility, project signals, trade communication management | SummaFlow \| AI Operations Intelligence for Global Trade | Bring scattered trade communications into one operational workspace with AI-powered visibility, traceability, alerts, and actionable project intelligence. | One Workspace for scattered project signals. | INDEX | Site-wide only | Manual Odoo Builder |
| Platform | `/platform` | AI trade operations platform | workflow intelligence, risk alerts, traceability, negotiation trends | SummaFlow Platform \| AI-Powered Trade Operations | See how SummaFlow turns fragmented operational signals into structured updates, traceable actions, risk alerts, and clearer trade workflows. | A Practical AI Layer for operations heavy teams. | INDEX | Site-wide only | Manual Odoo Builder |
| Solutions | Not published. `/solutions` returns 404 on staging and the menu has no Solutions entry. `solutions.js` expects `/solutions`. | trade operations solutions | sourcing, logistics, global trade operations | Trade Operations Solutions \| SummaFlow | Reduce manual tracking, missed updates, and operational blind spots with AI-powered workflows built for sourcing, logistics, and trade teams. | Not verifiable until the page exists | INDEX once published | Site-wide only | Manual Odoo Builder |
| Security | `/security` | AI trade platform security; data governance | traceability, access security, privacy controls | Security & Data Governance \| SummaFlow | Explore SummaFlow’s approach to data processing, AI model isolation, traceability, privacy controls, access security, and infrastructure protection. | Security and Data Governance Infrastructure | INDEX | Site-wide only | Manual Odoo Builder |
| Company | `/company` | SummaFlow; global trade operations software | traceability, operational visibility | About SummaFlow \| AI for Global Trade Operations | Learn why SummaFlow was built to bring greater clarity, traceability, and control to communication-heavy global trade operations. | Bringing Truth, Transparency, and Control to Global Trade Operations. | INDEX | Site-wide only | Manual Odoo Builder |
| Resources | `/blog` (redirects to canonical `/blog/resources-1`) | AI and global trade insights | sourcing, logistics, data governance, traceability | Resources & Insights \| SummaFlow | Explore practical insights on AI-powered operations, global trade workflows, data governance, traceability, sourcing, and logistics. | Insights for modern trade operations | INDEX | Odoo native: `Blog`, `CollectionPage`, `BreadcrumbList` | Manual Odoo Builder (title, description); Source-controlled (H1, `views/blog.xml`) |
| Request a Free Trial | `/contactus` | SummaFlow free trial; trade operations software demo | operational visibility, project signals | Request a Free Trial \| SummaFlow | Request a SummaFlow trial and see how your team can centralize project signals, reduce manual tracking, and improve operational visibility. | Request a Free Trial | INDEX | Site-wide only | Manual Odoo Builder |
| Privacy Policy | `/privacy-policy` | (none; legal page) | (none) | Privacy Policy \| SummaFlow | Read how SummaFlow handles personal information, data processing, storage, privacy, and related data protection practices. | Privacy Policy | INDEX | Site-wide only | Source-controlled (see shadowing note) |
| Terms and Conditions | `/terms-and-conditions` | (none; legal page) | (none) | Terms & Conditions \| SummaFlow | Review the terms and conditions governing access to and use of the SummaFlow platform and website. | Terms and Conditions for Summaflow LTD | INDEX | Site-wide only | Source-controlled |
| Support | `/support` | (none; support page) | (none) | Support \| SummaFlow | Get support and guidance for using SummaFlow and managing your trade operations workflow. | SummaFlow Support | INDEX | Site-wide only | Source-controlled |
| OAuth Verification | `/oauth-verification` | (none) | (none) | OAuth and Security Details \| SummaFlow | How SummaFlow requests, stores, and revokes OAuth access to connected accounts. | OAuth and Security Details | NOINDEX | Site-wide only | Source-controlled (`website_indexed = False`) |

Blog posts: each post gets its own SEO title and description in the Builder. Odoo emits `BlogPosting` and `BreadcrumbList` for each post natively; the module adds no article schema. No demo posts ship in module data.

## Structured data

Module block (`views/seo.xml`), one `<script type="application/ld+json">` in `<head>` on every page:

| Type | Fields |
|---|---|
| `Organization` | `@id` `https://summaflow.com/#organization`, `name` SummaFlow, `url` `https://summaflow.com/`, `email` info@summaflow.com, `telephone` +852 9220 9701, `address` (GF, Koon Nam House, 12-14 Shing Wong Street; Hong Kong; HK) |
| `WebSite` | `@id` `https://summaflow.com/#website`, `url`, `name` SummaFlow, `publisher` → Organization, `inLanguage` en-US |
| `SoftwareApplication` | `@id` `https://summaflow.com/#software`, `name` SummaFlow, `url`, `applicationCategory` BusinessApplication, `operatingSystem` Web, `description` (the approved homepage meta description), `publisher` → Organization |

Deliberately absent:
- `legalName`: the registered legal name is not verified.
- `sameAs`: **pending the real social media URLs from the client.** Add them to the `Organization` node when supplied.
- `logo` in the module block: the module ships no logo file. Odoo's native block supplies the website logo (`/web/image/website/1/logo`).
- `offers`, `aggregateRating`, `review`, `softwareVersion`: no such data exists. Without offers and ratings Google shows no software rich result; the node is there for entity understanding only.
- `FAQPage`: the site has no visible question and answer content.
- Module-made `BreadcrumbList`: no page has visible breadcrumb navigation. Odoo adds its own `BreadcrumbList` on blog pages.

Odoo native `Organization` block: Odoo saas~19.4 emits its own JSON-LD with an `Organization` node whose `@id` is `<main domain>/#organization`, whose `name` is the Website name, and whose `logo` is the website logo. On production the `@id` equals the module's, so the two blocks describe one entity. The Website name is currently `SUMMAFLOW`; set it to `SummaFlow` so both blocks give the same name (see launch checklist).

## Open Graph and social meta

Odoo generates these natively; the module adds none. Observed on staging: `og:type`, `og:title`, `og:site_name`, `og:url`, `og:image`, `og:description`, `twitter:card`, `twitter:image`.

- `og:title` and `og:description` follow the page SEO title and description, so filling the SEO dialog fills them.
- `og:image` and `twitter:image` default to the website logo. A page-specific image can be chosen in the SEO dialog.
- `og:site_name` is the Website name.
- No Twitter/X handle is set and none should be until an account is confirmed.

## Canonical, robots, sitemap

- Canonical: Odoo native, built from the website's main domain. Nothing in the module hardcodes a domain in a canonical tag.
- Robots: Odoo native `robots.txt` and page `robots` meta. Staging currently serves `Disallow: /` and `noindex, nofollow`; leave it.
- Sitemap: Odoo native `/sitemap.xml`. No custom sitemap.

## Known issues that are not source-controllable

1. **Heading levels in raw HTML.** One H1 per page holds only after the module's JavaScript runs. The Builder HTML itself has 11 `<h1>` on Home, 3 on Platform and none on Security. Google renders JavaScript and sees one H1. Crawlers that do not run JavaScript see the raw counts. The fix is to change heading levels in the Builder, words unchanged, and it must be tested because the module's scripts select headings by tag.
2. **`/privacy-policy` is shadowed on staging.** An older Builder page answers at that URL, so the module's Privacy page (H1, title, description) is not the one served. The served page has no H1 and the default title.
3. **`/terms-conditions` is still a live page** on staging, with no H1, and is listed in the sitemap. See redirects.
4. **Filtered blog listings** (tag, date, search with results) have no H1, because the listing header is shown only on the unfiltered listing.
5. **Home page image alt** `Business growth illustration` is an Odoo default on a Builder image. Set an accurate alt, or mark the image decorative, in the Builder.
6. **Entity details differ between pages** (visible copy, locked, reported only): footer and schema use `GF, Koon Nam House, 12-14 Shing Wong Street` and info@summaflow.com; the Terms page says `Shop A, G/F, Koon Nam House, No.14 Shing Wong Street`; Terms, Support and OAuth pages link `mailto:sever@summaflow.com`.

## Redirects

Set in Odoo, Website → Configuration → Redirects. Not implemented in the module.

| From | To | Type | Note |
|---|---|---|---|
| `/terms-conditions` | `/terms-and-conditions` | 301 | The old Builder page at `/terms-conditions` must be unpublished or deleted first, or the redirect will not take effect. |

No other old routes were found in the module, the menu, or the staging sitemap.
