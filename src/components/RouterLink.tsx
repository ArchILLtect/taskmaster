import { forwardRef } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";

type RenderArgs = { isActive: boolean; isPending: boolean };
type Child = React.ReactNode | ((args: RenderArgs) => React.ReactNode);

export type RouterLinkProps = Omit<NavLinkProps, "children"> & {
  children: Child;
};

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ children, ...props }, ref) => (
    <NavLink
      ref={ref}
      {...props}
      style={{ textDecoration: "none", ...(props.style as any) }}
    >
      {(args) =>
        typeof children === "function" ? (children as any)(args) : children
      }
    </NavLink>
  )
);

RouterLink.displayName = "RouterLink";