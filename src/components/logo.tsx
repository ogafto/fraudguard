import { useId } from "react";

export const LOGO_SHARDS = {
  bar: "M84.66,50.83L178.06,50.83L198.17,16L24.33,16Z",
  blade: "M135.2,154.34L80.05,58.81L19.72,23.98L135.2,224Z",
  hook: "M142.47,92.6L134.07,107.14L142.47,121.69L163.27,121.69L144.42,154.34L144.42,224L220.28,92.6Z",
} as const;

export const LOGO_PATH = Object.values(LOGO_SHARDS).join("");

export function LogoMark({
  className,
  chrome = false,
}: {
  className?: string;
  chrome?: boolean;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      {chrome && (
        <defs>
          <linearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#c9c9cf" />
            <stop offset="0.55" stopColor="#f4f4f6" />
            <stop offset="1" stopColor="#7c7c85" />
          </linearGradient>
        </defs>
      )}
      <path fill={chrome ? `url(#${id})` : "currentColor"} fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="size-[22px] text-fg" />
      <span className="text-[16px] font-semibold tracking-[-0.02em]">FraudGuard</span>
    </span>
  );
}
