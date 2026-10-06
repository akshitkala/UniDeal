import { Metadata } from 'next';
import LegalPage from '@/components/ui/LegalPage';

export const metadata: Metadata = {
  title: 'Safety Tips | UniDeal',
  description: 'How to stay safe when buying and selling on campus.',
};

export default function SafetyPage() {
  return (
    <LegalPage title="Safety Tips" lastUpdated="October 2026">
      <p>
        Most campus deals go smoothly. These tips help keep it that way. UniDeal connects buyers and sellers, but we do not handle the deal itself, so a little care on your side matters.
      </p>

      <h2>Before you meet</h2>
      <ul>
        <li>Check the listing carefully. Photos should show the real item, and the price and description should make sense.</li>
        <li>Ask questions on WhatsApp before agreeing to meet. Be cautious if someone avoids answering simple questions.</li>
        <li>Remember that we only confirm email addresses. UniDeal does not verify identity, so treat every new contact with normal caution.</li>
      </ul>

      <h2>When you meet</h2>
      <ul>
        <li>Meet in a busy, public place on campus, such as a canteen, library entrance, or main gate, and preferably in daylight.</li>
        <li>Tell a friend where you are going and who you are meeting, or bring someone along.</li>
        <li>Inspect the item fully before you pay. For electronics, switch it on and test it.</li>
        <li>If anything feels wrong, leave. No item is worth an unsafe situation.</li>
      </ul>

      <h2>Payments</h2>
      <ul>
        <li>Pay only when you have the item in your hands. Do not send advance payments, deposits, or "booking" money.</li>
        <li>Be careful with UPI. You only need to enter your PIN to send money, never to receive it. If someone asks you to approve a "collect request" or enter your PIN to get paid, it is a scam.</li>
        <li>Do not trust screenshots of payments. Check that the money has actually arrived in your account before handing over the item.</li>
        <li>Never share your OTP, PIN, or banking passwords with anyone.</li>
      </ul>

      <h2>Common scams to avoid</h2>
      <ul>
        <li>Someone who offers to pay more than the asking price and asks you to refund the difference.</li>
        <li>Someone who wants to pay or deliver through a courier or a third-party link you do not know.</li>
        <li>Prices that are far too good to be true, especially on electronics.</li>
        <li>Anyone who pressures you to decide immediately.</li>
      </ul>

      <h2>Report problems</h2>
      <p>
        If a listing looks fake, misleading, or breaks our rules, use the Report button on the listing. If someone is harassing or threatening you, stop replying and block them on WhatsApp. If you feel unsafe or have been a victim of fraud, contact campus security or the police. You can also tell us through the Contact Us page.
      </p>
    </LegalPage>
  );
}
