"use client";

import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setBreakpoint("mobile");
            } else if (width < 1024) {
                setBreakpoint("tablet");
            } else {
                setBreakpoint("desktop");
            }
        };

        // Initial check
        updateBreakpoint();

        window.addEventListener("resize", updateBreakpoint);
        return () => window.removeEventListener("resize", updateBreakpoint);
    }, []);

    return breakpoint;
}
