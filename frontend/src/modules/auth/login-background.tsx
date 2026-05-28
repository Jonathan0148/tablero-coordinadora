import Image from "next/image";

export function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Image
        src="/fondo-login.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/88 via-slate-900/72 to-slate-950/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--app-accent)_18%,transparent),transparent_55%)]" />
      <div className="absolute inset-0 backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,6,23,0.35)_100%)]" />
    </div>
  );
}
