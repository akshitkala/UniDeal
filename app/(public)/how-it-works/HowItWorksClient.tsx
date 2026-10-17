'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ShoppingBag,
  Package,
  Search,
  MessageCircle,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  Lock,
  Tag,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

type Role = 'buyer' | 'seller';

interface StepData {
  number: string;
  badge: string;
  title: string;
  body: string;
  keyHighlight: string;
  illustrationType:
    | 'buyer-search'
    | 'buyer-whatsapp'
    | 'buyer-meetup'
    | 'seller-form'
    | 'seller-privacy'
    | 'seller-sold';
}

const BUYER_STEPS: StepData[] = [
  {
    number: '01',
    badge: 'Discovery & Filters',
    title: 'Find what you need without group-chat chaos',
    body: 'Skip scrolling past hundreds of spam memes and expired messages. Filter campus listings by category, verified condition, and price in seconds.',
    keyHighlight: 'Direct keyword search • Clean categories • No spam noise',
    illustrationType: 'buyer-search',
  },
  {
    number: '02',
    badge: 'Private Handshake Bridge',
    title: 'One-tap pre-filled WhatsApp contact',
    body: 'Tap Contact Seller to instantly open a pre-filled WhatsApp prompt referencing the exact product link. The seller’s personal number is never scraped or shown on public web pages.',
    keyHighlight: 'Zero cold calls • Canonical product link attached • Instant chat',
    illustrationType: 'buyer-whatsapp',
  },
  {
    number: '03',
    badge: 'On-Campus Exchange',
    title: 'Meet at the library, test in person & pay',
    body: 'No couriers, no packaging, no shipping fees. Agree on a public campus landmark, inspect the item with your own hands, and transfer via UPI or cash only when 100% satisfied.',
    keyHighlight: 'Daylight public spots • Hands-on testing • Zero advance payment risk',
    illustrationType: 'buyer-meetup',
  },
];

const SELLER_STEPS: StepData[] = [
  {
    number: '01',
    badge: 'Quick Post',
    title: 'List your item in under 90 seconds',
    body: 'Snap 1 to 4 clean photos right from your hostel room, set your price, pick the condition, and add a straightforward title. No multi-step wizards or mandatory essays.',
    keyHighlight: 'Mobile-friendly upload • Clear condition badges • Instant listing',
    illustrationType: 'seller-form',
  },
  {
    number: '02',
    badge: 'Shielded Privacy',
    title: 'Your phone number stays completely private',
    body: 'Your WhatsApp number is never displayed on the public web or indexed by search engines. Only verified campus peers can generate the secure contact redirect.',
    keyHighlight: 'No public phone scraping • Bot protected • Verified student inquiries',
    illustrationType: 'seller-privacy',
  },
  {
    number: '03',
    badge: 'Direct Handover',
    title: 'Meet between classes & mark as sold',
    body: 'Pick a convenient break between lectures to hand over the item. Collect payment directly with zero platform commission, then mark the item Sold from your dashboard with one tap.',
    keyHighlight: '100% of your price kept • 1-tap status update • Clean dashboard',
    illustrationType: 'seller-sold',
  },
];

export default function HowItWorksClient() {
  const [activeRole, setActiveRole] = useState<Role>('buyer');
  const containerRef = useRef<HTMLDivElement>(null);
  const { fadeUp, cardHover, reduced } = useMotion();

  // Scroll tracking for the continuous animated pathway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 60%', 'end 90%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const currentSteps = activeRole === 'buyer' ? BUYER_STEPS : SELLER_STEPS;

  return (
    <main className="flex-1 bg-surface text-neutral-text overflow-hidden">
      {/* Hero Header */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-border bg-gradient-to-b from-neutral-50/60 to-surface">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            variants={fadeUp(M.offset.md, M.duration.entranceFast)}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Exchange Flow</span>
          </motion.div>

          <motion.h1
            variants={fadeUp(M.offset.lg, M.duration.entrance)}
            initial="hidden"
            animate="show"
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-neutral-text tracking-tight mb-4"
          >
            Two sides to every campus deal.
          </motion.h1>

          <motion.p
            variants={fadeUp(M.offset.md, M.duration.entrance, 0.1)}
            initial="hidden"
            animate="show"
            className="text-base sm:text-lg text-neutral-muted max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Whether you’re decluttering textbooks before semester break or hunting for an engineering calculator at half price, here is how UniDeal makes it effortless and safe.
          </motion.p>

          {/* Interactive Role Switcher Toggle */}
          <motion.div
            variants={fadeUp(M.offset.sm, M.duration.entrance, 0.15)}
            initial="hidden"
            animate="show"
            className="inline-flex p-1.5 rounded-full bg-neutral-100 border border-border shadow-sm max-w-md w-full sm:w-auto"
            role="tablist"
            aria-label="Select buyer or seller workflow"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeRole === 'buyer'}
              onClick={() => setActiveRole('buyer')}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-colors duration-200 min-h-[44px] ${
                activeRole === 'buyer'
                  ? 'text-white'
                  : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              {activeRole === 'buyer' && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <ShoppingBag className="w-4 h-4 relative z-10" />
              <span className="relative z-10">I want to Buy</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeRole === 'seller'}
              onClick={() => setActiveRole('seller')}
              className={`relative flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-sm font-semibold transition-colors duration-200 min-h-[44px] ${
                activeRole === 'seller'
                  ? 'text-white'
                  : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              {activeRole === 'seller' && (
                <motion.div
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Package className="w-4 h-4 relative z-10" />
              <span className="relative z-10">I want to Sell</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Animated Pathway Timeline */}
      <section ref={containerRef} className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 max-w-4xl relative">
          {/* Continuous Glowing Pathway Line (Desktop & Tablet) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-1 pointer-events-none"
          >
            {/* Passive track */}
            <div className="h-full w-full bg-neutral-200/80 rounded-full" />
            {/* Active animated stroke following scroll */}
            <motion.div
              style={{ scaleY: reduced ? 1 : smoothProgress, transformOrigin: 'top' }}
              className="absolute top-0 left-0 right-0 h-full bg-primary rounded-full shadow-[0_0_12px_rgba(22,163,74,0.4)]"
            />
          </div>

          {/* Stepper Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="space-y-12 sm:space-y-20 relative"
            >
              {currentSteps.map((step, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={step.number}
                    className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
                  >
                    {/* Center Milestone Node on Timeline */}
                    <div
                      aria-hidden="true"
                      className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface border-2 border-primary items-center justify-center shadow-md font-heading font-bold text-xs text-primary"
                    >
                      {step.number}
                    </div>

                    {/* Text Narrative Column */}
                    <motion.div
                      {...cardHover}
                      className={`p-6 sm:p-8 rounded-2xl border border-border bg-white shadow-sm flex flex-col justify-between ${
                        isEven ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="md:hidden text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                            STEP {step.number}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
                            {step.badge}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold font-heading text-neutral-text mb-3 leading-snug">
                          {step.title}
                        </h2>

                        <p className="text-sm sm:text-base text-neutral-muted leading-relaxed mb-6">
                          {step.body}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center gap-2 text-xs font-medium text-primary">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{step.keyHighlight}</span>
                      </div>
                    </motion.div>

                    {/* Interactive CSS Illustration Preview Column */}
                    <div
                      className={`flex justify-center ${
                        isEven ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <IllustrationMockup type={step.illustrationType} />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Campus Rules of Engagement (Trust & Safety) */}
      <section className="py-12 border-y border-border bg-neutral-50/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-text mb-2">
              Campus Rules of Engagement
            </h2>
            <p className="text-sm text-neutral-muted">
              Built on mutual student trust. Three simple rules every buyer and seller follows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-border bg-white shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1.5 text-neutral-text">
                Public Campus Spots
              </h3>
              <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                Always meet in daylight at common spots like the Central Library, student canteen, or main department foyer.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-white shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1.5 text-neutral-text">
                Inspect Before Paying
              </h3>
              <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                Take two minutes to flip textbook pages, plug in electronics, or check calculator batteries before completing the deal.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-white shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1.5 text-neutral-text">
                Zero Advance Payments
              </h3>
              <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                Never transfer booking deposits or pre-payments over UPI. Pay in person only after you have the item in your hands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section className="py-14 sm:py-16 bg-surface">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-3">
            Ready to experience seamless campus trading?
          </h2>
          <p className="text-neutral-muted text-sm sm:text-base mb-8">
            Join verified students already buying and selling without spam, clutter, or commission.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/browse"
              className="py-3 px-6 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 text-center min-h-[44px] flex items-center justify-center shadow-sm"
            >
              Browse Campus Listings
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/sell"
              className="py-3 px-6 bg-white text-neutral-text border border-border rounded-md font-semibold text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 text-center min-h-[44px] flex items-center justify-center"
            >
              Post an Item for Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// -------------------------------------------------------------
// Interactive CSS Illustration Previews
// Fully customized, vector-based, responsive UI mockups
// -------------------------------------------------------------

function IllustrationMockup({ type }: { type: StepData['illustrationType'] }) {
  if (type === 'buyer-search') {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-neutral-50/80 p-4 shadow-sm text-left font-sans">
        {/* Mock Search Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white shadow-xs mb-3">
          <Search className="w-4 h-4 text-neutral-muted" />
          <span className="text-xs text-neutral-text font-medium">Casio FX-991</span>
          <span className="ml-auto text-[10px] text-neutral-muted bg-neutral-100 px-1.5 py-0.5 rounded">
            Electronics
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-primary text-white font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" /> Like New
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white border border-border text-neutral-muted flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Under ₹1,000
          </span>
        </div>

        {/* Mock Listing Card */}
        <div className="p-2.5 rounded-lg border border-border bg-white flex gap-3 items-center">
          <div className="w-14 h-14 rounded-md bg-neutral-100 flex items-center justify-center text-primary text-xs font-bold border border-border/50">
            CALC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-text truncate">
              Casio FX-991CW Calculator
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-primary font-heading">₹ 650</span>
              <span className="text-[10px] text-neutral-muted">Fixed price</span>
            </div>
            <p className="text-[10px] text-neutral-muted mt-0.5">Seller: Akshit • 2h ago</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'buyer-whatsapp') {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-[#F0FDF4] p-4 shadow-sm text-left">
        {/* Mock WhatsApp Chat Bubble */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200/60">
          <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px] font-bold">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#14532D]">WhatsApp Chat Bridge</span>
          <span className="ml-auto text-[10px] text-green-700 bg-green-100 px-1.5 py-0.2 rounded font-medium">
            Pre-filled
          </span>
        </div>

        <div className="bg-white rounded-lg p-3 border border-green-200 shadow-xs mb-3 text-xs text-neutral-text leading-relaxed">
          <p className="text-neutral-muted text-[11px] mb-1">Generated message:</p>
          <p className="font-medium text-[11px]">
            &ldquo;Hi Akshit, I saw your listing for <span className="text-primary font-semibold">Casio FX-991CW</span> on UniDeal (unideal.in/listing/casio-fx-991cw). Is it still available to pick up on campus?&rdquo;
          </p>
        </div>

        <div className="py-2 px-3 rounded-md bg-[#14532D] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Contact Seller on WhatsApp</span>
        </div>
      </div>
    );
  }

  if (type === 'buyer-meetup') {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-neutral-50/80 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-text flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Campus Exchange Spot
          </span>
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="p-2 rounded-lg bg-white border border-border flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium">Central Library Foyer</span>
            <span className="ml-auto text-[10px] text-neutral-muted">Public & Lit</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-border flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium">Student Canteen Steps</span>
            <span className="ml-auto text-[10px] text-neutral-muted">Between classes</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-[11px] text-[#14532D] flex items-start gap-1.5">
          <Handshake className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          <span>Test the calculator, flip the pages, then pay via UPI or cash. Zero transit risk.</span>
        </div>
      </div>
    );
  }

  if (type === 'seller-form') {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-neutral-50/80 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-text">Post Listing Preview</span>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> ~90s
          </span>
        </div>

        {/* Photo boxes */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="aspect-square rounded-md border border-primary/30 bg-primary/5 flex items-center justify-center text-[10px] font-medium text-primary">
            Photo 1 ✓
          </div>
          <div className="aspect-square rounded-md border border-primary/30 bg-primary/5 flex items-center justify-center text-[10px] font-medium text-primary">
            Photo 2 ✓
          </div>
          <div className="aspect-square rounded-md border-2 border-dashed border-border bg-white flex items-center justify-center text-[10px] text-neutral-muted">
            + Add
          </div>
        </div>

        {/* Mini inputs */}
        <div className="space-y-1.5 text-xs">
          <div className="p-2 rounded border border-border bg-white text-neutral-text font-medium truncate text-[11px]">
            Engineering Mathematics Vol 2
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded border border-border bg-white font-bold text-primary text-[11px]">
              ₹ 350
            </div>
            <div className="flex-1 p-2 rounded border border-border bg-white text-neutral-muted text-[11px] flex items-center justify-center">
              Condition: Good
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'seller-privacy') {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-neutral-50/80 p-4 shadow-sm text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-text">Privacy Guarantee</p>
            <p className="text-[10px] text-neutral-muted">Zero web number scraping</p>
          </div>
        </div>

        <div className="space-y-2 mb-3 text-xs">
          <div className="p-2.5 rounded-lg bg-white border border-border flex items-center justify-between">
            <span className="text-neutral-muted text-[11px]">Public Web Profile</span>
            <span className="font-mono text-neutral-400 font-bold tracking-widest text-[11px]">
              •••••• 9018
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-[#14532D] text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary" />
            <span>Only verified logged-in students can request WhatsApp handoff.</span>
          </div>
        </div>

        <div className="text-[10px] text-neutral-muted flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-primary" />
          <span>No telemarketers, bots, or unverified strangers.</span>
        </div>
      </div>
    );
  }

  // seller-sold
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-neutral-50/80 p-4 shadow-sm text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-neutral-text">Dashboard Status</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-neutral-600 px-2 py-0.5 rounded-full">
          Sold
        </span>
      </div>

      <div className="p-3 rounded-lg border border-border bg-white shadow-xs mb-3">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-semibold text-neutral-text truncate">
            Semester 3 Mechanical Drafter
          </p>
          <span className="text-xs font-bold text-neutral-text">₹ 400</span>
        </div>
        <p className="text-[10px] text-neutral-muted">Buyer: Rahul • Met at Canteen</p>
      </div>

      <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-[11px] text-[#14532D] flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-medium">Deal complete. 0% platform fee deducted.</span>
      </div>
    </div>
  );
}
