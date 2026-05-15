import Image from "next/image";
import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-8 w-8", image: 32 },
  md: { box: "h-9 w-9", image: 36 },
  lg: { box: "h-10 w-10", image: 40 },
} as const;

interface LogoProps {
  size?: keyof typeof sizeMap;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = "md", className, priority = false }: LogoProps) {
  const { box, image } = sizeMap[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-border/60 shadow-sm",
        box,
        className
      )}
    >
      <Image
        src={branding.logo.src}
        alt={branding.logo.alt}
        width={image}
        height={image}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
