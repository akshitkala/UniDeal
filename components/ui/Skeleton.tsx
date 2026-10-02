import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-border rounded animate-pulse motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}
