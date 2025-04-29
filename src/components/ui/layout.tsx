
import * as React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Layout({ className, children, ...props }: LayoutProps) {
  return (
    <div className={cn("flex flex-col flex-1", className)} {...props}>
      {children}
    </div>
  );
}

interface LayoutHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LayoutHeader({ className, children, ...props }: LayoutHeaderProps) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

interface LayoutTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function LayoutTitle({ className, children, ...props }: LayoutTitleProps) {
  return (
    <h1 className={cn("text-2xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h1>
  );
}

interface LayoutContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LayoutContent({ className, children, ...props }: LayoutContentProps) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}
