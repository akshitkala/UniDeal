# UniDeal — Needs-Human Action Items

## 1. Overview
The following checklist items require physical hardware, real communication channels (SMTP, WhatsApp, Instagram), or human founder sign-off that cannot be verified autonomously by automation.

## 2. Pre-Launch Verification Checklist

### Infrastructure & Secrets (INF / SEC)
- [ ] **SEC-22 (P0)**: Verify that all production environment variables are properly mirrored in the Vercel project dashboard and no secret keys remain visible in public Git history.
- [ ] **SEC-23 (P0)**: In Supabase dashboard, verify that Site URL and Auth Redirect URLs point to the production custom domain (`https://unideal.app`), not localhost or an outdated preview URL.
- [ ] **INF-01 (P0)**: Verify that the Vercel cron job has successfully fired at 03:00 UTC and pinged `/api/cron/keepalive` with HTTP 200.
- [ ] **INF-02 (P0)**: In Supabase production project, take a manual database backup or snapshot before public traffic begins.
- [ ] **INF-03 (P0)**: Verify Resend transactional email domain is fully verified in the Resend dashboard and test emails arrive in the inbox rather than spam.
- [ ] **INF-04 (P1)**: Check Cloudinary usage dashboard and verify upload preset is locked to `unideal/listings` with a 5MB size cap.
- [ ] **INF-05 (P1)**: Confirm Vercel logs, Supabase logs, and external uptime monitor (e.g. Better Uptime) are actively monitored.
- [ ] **INF-06 (P0)**: Ensure all launch code is pushed to `origin main`, progress is documented, and release commit is tagged.
- [ ] **INF-07 (P0)**: Review rollback plan (reverting to previous Vercel deployment if critical regression occurs).
- [ ] **INF-08 (P0)**: Confirm custom domain DNS, SSL/HTTPS certificate, and `www` to non-`www` 301 redirects are functional.

### Real Physical Device Walkthrough (MAN / RSP)
- [ ] **RSP-13 & MAN-05 (P0)**: Test on a real **iPhone Safari**:
  - Test keyboard overlap during Sell form entry.
  - Test dynamic address bar expand/collapse on scroll.
  - Test camera / photo upload with an actual full-size iPhone photo (12-48MP HEIC/JPEG).
- [ ] **RSP-14 (P0)**: Test on a real **Android Chrome** device:
  - Verify bottom navigation bar against OS gesture navigation.
  - Test physical input focus and viewport height resizing.
- [ ] **RSP-15 (P1)**: Spot check layout on a physical **iPad / tablet**.
- [ ] **A11Y-10 (P1)**: Run a quick **VoiceOver** screen reader pass on Home and Listing Detail on iOS.

### Marketing, Social & Legal Sign-off (META / CPY / MAN)
- [ ] **META-14 & MAN-01 (P0)**: Paste a listing link into a WhatsApp chat and an Instagram DM to confirm rich OpenGraph preview snippet renders with title, description, and listing photo.
- [ ] **MAN-02 (P0)**: Show the Home page to an uninitiated student; verify they understand the product within 5 seconds.
- [ ] **MAN-03 (P0)**: Tap Contact Seller on a live listing and verify real WhatsApp mobile application launches with pre-filled message.
- [ ] **MAN-04 (P0)**: Complete real signup on live domain and inspect the verification email appearance and delivery speed.
- [ ] **MAN-07 (P0)**: Ask a student who has never seen UniDeal to locate an item and contact the seller unaided; note any hesitation points.
- [ ] **CPY-06 (P0)**: Verify founder details, contact email (`support@unideal.app`), and Our Story narrative accuracy.
- [ ] **CPY-07 (P0)**: Founder review and final approval of Privacy Policy, Terms of Service, and Safety tips.
- [ ] **CPY-08 (P0)**: Prune test listings, dummy reports, and test accounts from production Supabase database prior to public launch.
- [ ] **UI-16 (P1)**: Review all baseline screenshots in `checklist_report/screenshots/` for visual polish and spacing.
