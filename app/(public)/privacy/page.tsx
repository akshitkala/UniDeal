import { Metadata } from 'next';
import LegalPage from '@/components/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | UniDeal',
  description: 'How we collect, use, and protect your information on UniDeal.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="October 2026">
      <p>
        UniDeal is a campus marketplace that helps students find and contact each other to buy and sell used items. It is run by an individual founder and is not affiliated with any university. This policy explains what information we collect, why, and what we do with it.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>Account details: your email address, your password (stored in hashed form by our authentication provider; we cannot see it), and your full name.</li>
        <li>Profile details (optional): your branch, year, and WhatsApp number.</li>
        <li>Listings: the title, description, price, category, condition, and photos you upload.</li>
        <li>Activity: which listings you contact sellers about (and when), listings you report, and how many times each listing is viewed.</li>
        <li>Support messages: the name, email, and message you send through the Contact Us form.</li>
        <li>Technical data: a login session cookie, and standard server logs kept by our hosting provider.</li>
      </ul>

      <h2>2. What other people can see</h2>
      <ul>
        <li>On listings, other users see only your first name. Your full name, branch, year, and email are never shown to other users.</li>
        <li>Your WhatsApp number is never displayed anywhere on UniDeal.</li>
        <li>Your listings, including their photos, are visible to anyone who visits UniDeal, including people who are not logged in.</li>
      </ul>

      <h2>3. How WhatsApp contact works</h2>
      <p>
        When a verified user taps "Contact Seller", we open a WhatsApp chat with the seller using a link generated on our server. Once that chat opens, the buyer's WhatsApp will show the seller's phone number, and the seller will see the buyer's. If you are not comfortable with that, do not add a WhatsApp number to your profile. Once a chat begins, it happens on WhatsApp and is covered by WhatsApp's own terms and privacy policy, not ours.
      </p>

      <h2>4. How we use your information</h2>
      <ul>
        <li>To run your account and let you post, edit, and manage listings.</li>
        <li>To let verified users contact sellers, and to enforce a limit of 50 contacts per user per day.</li>
        <li>To moderate the platform, including reviewing reports, removing listings, and banning accounts that break our Terms.</li>
        <li>To reply to messages you send us.</li>
        <li>To keep the service secure and working.</li>
      </ul>
      <p>
        We do not sell your personal information. We do not currently show advertising. If that changes, we will update this policy before it happens.
      </p>

      <h2>5. Services that process your data</h2>
      <p>
        We use these providers to run UniDeal. They handle data on our behalf:
      </p>
      <ul>
        <li>Supabase: authentication and database.</li>
        <li>Vercel: website hosting.</li>
        <li>Cloudinary: storage and delivery of listing photos.</li>
        <li>Resend: delivery of messages sent through the Contact Us form.</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        We use only the cookies needed to keep you logged in. We do not use advertising or cross-site tracking cookies.
      </p>

      <h2>7. How long we keep data</h2>
      <p>
        We keep your information while your account exists. If an account is banned, its listings are hidden but kept for record-keeping. Records of contact requests and reports are kept for abuse prevention and moderation.
      </p>

      <h2>8. Your choices and rights</h2>
      <ul>
        <li>You can view and update your name, branch, year, and WhatsApp number on your Profile page at any time.</li>
        <li>You can edit, mark as sold, or delete your own listings.</li>
        <li>You can ask us to delete your account and the data linked to it through the Contact Us page. We will do so, except for anything we are required to keep by law or need to keep to prevent abuse. We will make reasonable efforts to remove your listing photos as well.</li>
        <li>You can ask us what personal data we hold about you or ask us to correct it through the same page.</li>
      </ul>

      <h2>9. Security</h2>
      <p>
        We use access controls, hashed passwords, and server-side checks to protect your data, and your WhatsApp number is never sent to your browser as a field. No online service is completely secure, so we cannot guarantee absolute security.
      </p>

      <h2>10. Who can use UniDeal</h2>
      <p>
        UniDeal is for people aged 18 and over. We do not knowingly collect information from anyone under 18. If you believe a minor has created an account, contact us and we will remove it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The "Last updated" date at the top shows the latest version. If changes are significant, we will make that clear on the site.
      </p>

      <h2>12. Contact</h2>
      <p>
        For privacy questions or requests, use the Contact Us page.
      </p>
    </LegalPage>
  );
}
