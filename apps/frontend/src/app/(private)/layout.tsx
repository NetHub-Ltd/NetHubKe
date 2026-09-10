/**
 * Private route group layout.
 * Public Navbar/Footer are suppressed via AppChrome; this layout is a
 * passthrough so nested dashboard pages own the shell.
 */
export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
