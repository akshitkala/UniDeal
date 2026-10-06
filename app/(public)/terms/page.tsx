import { Metadata } from 'next';
import LegalPage from '@/components/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service | UniDeal',
  description: 'Terms and conditions for using UniDeal.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="October 2026">
      <p>
        By using UniDeal you agree to these Terms. If you do not agree, please do not use the service.
      </p>

      <h2>1. What UniDeal is</h2>
      <p>
        UniDeal is a platform where students can list items and find items listed by other students. UniDeal is a bridge between buyers and sellers, nothing more. We are not a party to any sale. We do not handle payments, hold money, deliver items, inspect items, or guarantee any listing, user, or transaction. UniDeal is not affiliated with any university.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>You must provide a valid email address and verify it before you can post listings or contact sellers.</li>
        <li>You are responsible for your account and for keeping your password secure.</li>
        <li>You must give accurate information. One person should not run multiple accounts to get around limits or bans.</li>
      </ul>

      <h2>3. Listing rules</h2>
      <p>
        When you post a listing, you confirm that:
      </p>
      <ul>
        <li>You own the item or have the right to sell it.</li>
        <li>The title, description, price, condition, and photos are accurate and not misleading, and the photos show the actual item.</li>
        <li>You will mark the item as sold when it is no longer available.</li>
      </ul>
      <p>
        You may not list:
      </p>
      <ul>
        <li>Illegal items, stolen goods, or counterfeit goods.</li>
        <li>Weapons, explosives, or anything dangerous.</li>
        <li>Drugs, alcohol, tobacco, or vaping products.</li>
        <li>Adult or sexually explicit content.</li>
        <li>Live animals.</li>
        <li>Exam papers, answer keys, or academic dishonesty services.</li>
        <li>Services, rentals, or anything that is not a physical item.</li>
        <li>Anything else prohibited by Indian law or by your institution's rules.</li>
      </ul>

      <h2>4. Contacting sellers</h2>
      <ul>
        <li>Only verified, non-banned users can contact sellers.</li>
        <li>Each user can contact up to 50 sellers in a rolling 24-hour period.</li>
        <li>Use contact details only to discuss the listing you contacted the seller about. Do not spam, harass, threaten, or pressure anyone, and do not save or share another person's number for other purposes.</li>
      </ul>

      <h2>5. Deals between users</h2>
      <p>
        All deals happen between you and the other user, off the platform. You are responsible for deciding whether to go ahead with a deal, for inspecting the item, for agreeing on a price, and for payment and handover. Please read our Safety page before meeting anyone. UniDeal does not verify the identity of users beyond confirming their email address, and is not responsible for the conduct of any user, the quality or legality of any item, or any loss arising from a deal.
      </p>

      <h2>6. Reporting and moderation</h2>
      <ul>
        <li>Any verified user can report a listing.</li>
        <li>We may review reports, remove listings, and suspend or ban accounts that break these Terms or harm other users, with or without notice.</li>
        <li>Banned users' listings are hidden from other users.</li>
        <li>We may decline or remove any listing at our discretion, including through manual review before a listing goes live.</li>
      </ul>

      <h2>7. Your content</h2>
      <p>
        You keep ownership of what you post. By posting a listing, you give UniDeal a non-exclusive, worldwide, royalty-free right to host and display it on the service for as long as it is live, solely to operate UniDeal. You are responsible for what you post. Do not upload photos or text you do not have the right to use.
      </p>

      <h2>8. Using the service properly</h2>
      <p>
        You agree not to:
      </p>
      <ul>
        <li>Break the law or these Terms.</li>
        <li>Attempt to access data or accounts that are not yours.</li>
        <li>Scrape, copy, or collect data from UniDeal in bulk, or collect other users' contact details.</li>
        <li>Interfere with how the service works, or try to get around rate limits, verification, or bans.</li>
        <li>Use UniDeal to scam, impersonate, or mislead anyone.</li>
      </ul>

      <h2>9. Availability</h2>
      <p>
        UniDeal is provided free of charge and "as is" and "as available". We may change, pause, or stop any part of the service at any time, and we do not promise it will always be available or error-free.
      </p>

      <h2>10. Limits of our responsibility</h2>
      <p>
        To the fullest extent allowed by law, UniDeal and its founder are not liable for any loss, damage, or harm arising from your use of the service, from any listing, or from any dealings between users, including lost money, undelivered or misdescribed items, or personal safety incidents. Nothing in these Terms excludes responsibility that cannot be excluded under applicable law.
      </p>

      <h2>11. Ending your account</h2>
      <p>
        You can stop using UniDeal at any time and can ask us to delete your account through the Contact Us page. We can suspend or end your access if you break these Terms.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The "Last updated" date shows the latest version. Continuing to use UniDeal after changes means you accept the updated Terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of India.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, use the Contact Us page.
      </p>
    </LegalPage>
  );
}
