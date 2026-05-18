import Link from "next/link";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-ink-950 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "bg-ink-800 text-ink-100 hover:bg-ink-700 border border-ink-700 disabled:opacity-60",
  danger:
    "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-60",
};

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

interface ButtonProps
  extends CommonProps,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children"
    > {
  href?: undefined;
}

interface LinkProps extends CommonProps {
  href: string;
}

type Props = ButtonProps | LinkProps;

export function Button(props: Props) {
  const { variant = "primary", className = "", children } = props;
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition";
  const cls = `${base} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  const { variant: _v, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
