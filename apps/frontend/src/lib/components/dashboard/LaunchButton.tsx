type LaunchButtonProps = {
  productSlug: string;
  productName: string;
  disabledReason?: string | null;
};

/**
 * Product launch is intentionally unavailable until one-time server-to-server
 * launch-code redemption is implemented. No browser product-token handoff.
 */
export default function LaunchButton({
  productName,
  disabledReason,
}: LaunchButtonProps) {
  const title = disabledReason || `Secure launch for ${productName} is not available yet`;
  return (
    <span
      className="text-[10px] uppercase tracking-wide text-outline"
      title={title}
      aria-disabled="true"
    >
      Launch soon
    </span>
  );
}
