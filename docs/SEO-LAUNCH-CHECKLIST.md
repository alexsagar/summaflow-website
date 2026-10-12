# SEO Launch Checklist

Production only. Staging (`summaflow-redesign-test.odoo.com`) stays blocked: `robots.txt` `Disallow: /` and `noindex, nofollow`. Do not unblock staging.

Visible website copy is locked. No step here changes page wording.

Reference: [SEO-METADATA.md](SEO-METADATA.md).

## Pending from client

- [ ] **Real social media URLs.** Until supplied: `sameAs` stays out of the schema, and the three footer icons keep their placeholder `/your-page` links.

## Pre-launch

- [ ] **Production domain.** `summaflow.com` set as the website's main domain. Canonical, `og:url`, sitemap URLs and Odoo's native schema all derive from it.
- [ ] **Website name.** Set to `SummaFlow` (currently `SUMMAFLOW`). It feeds `og:site_name`, default page titles, and the `name` in Odoo's native Organization schema.
- [ ] **Builder titles and descriptions.** Fill the SEO dialog per SEO-METADATA.md for Home, Platform, Security, Company, Resources (`/blog`), Request a Free Trial (`/contactus`), and Solutions when it is published. Current staging values are Odoo defaults.
- [ ] **Privacy page.** Remove or unpublish the older Builder page that answers at `/privacy-policy`, so the module's page (with its H1, title and description) is served.
- [ ] **One H1.** Confirm one H1 on each page in the browser. Decide whether to correct heading levels in the Builder for crawlers that do not run JavaScript (SEO-METADATA.md, known issue 1). Words stay unchanged.
- [ ] **Schema.** View source: module block has Organization, WebSite, SoftwareApplication; no `legalName`, no `sameAs`, no staging domain.
- [ ] **Canonical.** Each page's canonical uses `https://summaflow.com` once the main domain is set.
- [ ] **Alt text.** Product screenshots carry descriptive alts from the module. Set the alt on the Home page Builder image now reading `Business growth illustration`. Give each blog cover a descriptive alt.
- [ ] **Internal links.** Header, footer, CTAs, Privacy, Terms, Support, Resources resolve. Sign In goes to `https://app.summaflow.com/login`. WhatsApp uses `wa.me`.
- [ ] **Redirects.** Unpublish or delete the old `/terms-conditions` page, then add a 301 from `/terms-conditions` to `/terms-and-conditions` (Website → Configuration → Redirects).
- [ ] **OAuth noindex.** `/oauth-verification` shows Indexed = off after import.
- [ ] **Social placeholders reviewed.** Footer icons still link to `/your-page` placeholders; replace when the client supplies URLs, then add `sameAs`.
- [ ] **Blog content.** Review the post currently on staging before it goes to production.

## Go-live

- [ ] Import the final module (version in `__manifest__.py`).
- [ ] Confirm `summaflow.com` is the main domain.
- [ ] Remove the production crawl block: delete the custom `Disallow: /` from robots.txt (Website → Configuration → Settings → SEO). Production only.
- [ ] Verify `https://summaflow.com/robots.txt`: no site-wide `Disallow: /`, sitemap line points at `summaflow.com`.
- [ ] Verify indexed state: public pages have no `noindex`; `/oauth-verification` and any test or internal pages are `noindex`.
- [ ] Verify `https://summaflow.com/sitemap.xml`: lists the public pages, no staging domain, no `/terms-conditions`.
- [ ] Verify metadata: title, description and canonical on each page match SEO-METADATA.md.
- [ ] Verify structured data: view source or run the Rich Results Test on Home and one blog post.

## Post-launch

- [ ] Submit `https://summaflow.com/sitemap.xml` in Google Search Console (verify the domain property first).
- [ ] Verify indexing: request indexing for the public pages and watch the Pages report.
- [ ] Inspect 404 and redirect behavior, including `/terms-conditions`.
- [ ] Inspect search appearance: titles, descriptions, and the structured data report.
