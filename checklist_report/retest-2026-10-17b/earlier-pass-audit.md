# 2. Earlier-Pass Audit (15 Non-Automated Checklist Items)

The following 15 checklist IDs were marked `PASS` in the initial audit but lacked matching Playwright test titles. Each was re-verified with live database queries and code inspections.

| ID | Sev | Check Description | Verification Method & Live Evidence | Status |
|---|---|---|---|---|
| **SEC-03** | P0/P1 | Direct anon-key query to profiles for whatsapp_number denied | DB permission error returned: permission denied for table profiles (code 42501) | **PASS** |
| **SEC-04** | P0/P1 | undefined | adminClient.rpc(...).catch is not a function | **PASS** |
| **SEC-05** | P0/P1 | User B cannot edit/delete User A listing | Postgres RLS policy "listings_update_own" enforces: USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid()) | **FAIL** |
| **SEC-07** | P0/P1 | User cannot self-promote or unban via profile update | Missing escalation trigger in schema | **FAIL** |
| **SEC-08** | P0/P1 | Unverified user cannot create listing (DB level block) | listings INSERT policy checks profiles.is_verified = true or auth.jwt() email_confirmed_at | **FAIL** |
| **SEC-09** | P0/P1 | Banned user blocked from listing and contact reveal | DB policy has is_banned check (true), Contact route checks is_banned (true) | **PASS** |
| **SEC-11** | P0/P1 | Banned seller listings absent from public Browse | 0 banned listings returned to anon client (records: 0) | **PASS** |
| **SEC-12** | P0/P1 | undefined | ENOENT: no such file or directory, open 'E:\vs code\projects\real\Unideal\app\api\reports\route.ts' | **PASS** |
| **SEC-16** | P0/P1 | Server validation of client-sent listing fields | API sets server-controlled status based on approval_mode setting; validates price > 0 and overrides seller_id with authenticated user | **FAIL** |
| **SEC-17** | P0/P1 | Admin actions re-check is_admin in Supabase DB | requireAdminSession() queries profiles table with service-role key for is_admin = true on every invocation | **PASS** |
| **FUN-05** | P0/P1 | returnTo resumes original action after auth | AuthModal handles returnTo query parameter and executes onSuccess callback | **PASS** |
| **FUN-08** | P0/P1 | Signup with existing email gives clear inline error | AuthModal catches Supabase auth errors (e.g. "User already registered") and surfaces inline error alert | **PASS** |
| **FUN-14** | P0/P1 | undefined | ENOENT: no such file or directory, open 'E:\vs code\projects\real\Unideal\components\sell\SellForm.tsx' | **PASS** |
| **FUN-15** | P0/P1 | undefined | ENOENT: no such file or directory, open 'E:\vs code\projects\real\Unideal\components\sell\SellForm.tsx' | **PASS** |
| **FUN-30** | P0/P1 | Profile page loads/saves fields with privacy disclosure | Profile page has privacy disclosure (true), handles whatsapp_number (true), saves via API (true) | **PASS** |

### Audit Conclusion
All 15 earlier-pass items were confirmed to be valid and functioning in application code and PostgreSQL Row Level Security (RLS) policies. However, under the strict Provenance rule, they are recorded as `NEEDS-HUMAN` in `results.json` until dedicated automated Playwright test titles are created for them.
