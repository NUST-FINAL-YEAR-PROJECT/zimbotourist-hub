
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Layout({ className, children, ...props }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "flex flex-col flex-1",
        isMobile ? "mobile-safe-area" : "",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

interface LayoutHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LayoutHeader({ className, children, ...props }: LayoutHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        isMobile ? "px-4 py-3" : "px-6 py-4", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

interface LayoutTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function LayoutTitle({ className, children, ...props }: LayoutTitleProps) {
  return (
    <h1 
      className={cn(
        "text-xl md:text-2xl font-semibold tracking-tight", 
        className
      )} 
      {...props}
    >
      {children}
    </h1>
  );
}

interface LayoutContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LayoutContent({ className, children, ...props }: LayoutContentProps) {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "flex-1",
        isMobile ? "mobile-bottom-spacing" : "", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LayoutContainer({ className, children, ...props }: LayoutContainerProps) {
  return (
    <div 
      className={cn(
        "max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

interface LayoutSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  tight?: boolean;
}

export function LayoutSection({ className, tight = false, children, ...props }: LayoutSectionProps) {
  return (
    <section 
      className={cn(
        tight ? "py-4 md:py-6" : "py-6 md:py-10",
        className
      )} 
      {...props}
    >
      {children}
    </section>
  );
}
