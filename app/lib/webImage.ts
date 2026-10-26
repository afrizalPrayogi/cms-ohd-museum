export const WEB_IMAGE_FALLBACKS = {
  banner: "/assets/images/home-slider-1.png",
  section: "/assets/images/home-section-2-thumb.png",
  tab: "/assets/images/home-section-tab.png",
  featureIcon: "/assets/icons/home-development.svg",
  testimonialAvatar: "/assets/images/home-testi-person-1.png",
  testimonialBackground: "/assets/images/home-testi-bg-1.png",
  insight: "/assets/images/home-latest-post-1.jpg",
} as const;

export function resolveWebImage(src: string | null | undefined, fallback: string) {
  if (typeof src !== "string") return fallback;
  const normalized = src.trim();
  return normalized ? normalized : fallback;
}

export function applyImageFallback(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallback: string
) {
  const target = event.currentTarget;
  if (!target || target.src.endsWith(fallback)) return;
  target.onerror = null;
  target.src = fallback;
}
