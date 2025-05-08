
import { useState, useEffect, useMemo } from "react";

const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
};

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook that returns whether the current viewport is mobile-sized
 * @param breakpoint The breakpoint to check against (default: md)
 * @returns boolean indicating if viewport is smaller than the specified breakpoint
 */
export function useIsMobile(breakpoint: Breakpoint = "md") {
  const breakpointWidth = BREAKPOINTS[breakpoint];
  
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on initial mount
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = useMemo(() => windowWidth < breakpointWidth, [windowWidth, breakpointWidth]);
  
  return isMobile;
}

/**
 * Hook that returns the current breakpoint based on window width
 * @returns The current breakpoint as a string
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("md");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < BREAKPOINTS.xs) setBreakpoint("xs");
      else if (width < BREAKPOINTS.sm) setBreakpoint("sm");
      else if (width < BREAKPOINTS.md) setBreakpoint("md");
      else if (width < BREAKPOINTS.lg) setBreakpoint("lg");
      else if (width < BREAKPOINTS.xl) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on initial mount
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook that returns a set of boolean values indicating if the viewport
 * is larger than each breakpoint
 */
export function useBreakpoints() {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on initial mount
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return useMemo(() => ({
    isXs: windowWidth >= BREAKPOINTS.xs,
    isSm: windowWidth >= BREAKPOINTS.sm,
    isMd: windowWidth >= BREAKPOINTS.md,
    isLg: windowWidth >= BREAKPOINTS.lg,
    isXl: windowWidth >= BREAKPOINTS.xl,
    is2xl: windowWidth >= BREAKPOINTS["2xl"],
  }), [windowWidth]);
}
