import React from 'react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-[720px]">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-text font-heading tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-sm text-neutral-muted">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="
          text-neutral-text text-[16px] leading-[1.6]
          [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-heading [&>h2]:mt-10 [&>h2]:mb-4
          [&>p]:mb-4
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ul>li]:mb-2
        ">
          {children}
        </div>
      </div>
    </main>
  );
}
