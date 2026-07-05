// Signature visual motif for the app: a solid-fill color chip with a
// white lucide icon inside. Replaces the earlier letter-based badges
// (first a rotated ink stamp, then a monospace square tag) with real
// per-type icons, consistent with the icons already used in
// Sidebar/Header/LandingPage.
//
// Usage: <StampBadge icon={Wallet} color="blue" size={38} />

const FILL = {
  blue: '#6d4aff', // checking — primary violet
  green: '#16a394', // savings — teal
  red: '#e0455c', // credit card — red
  brass: '#1fb8cc', // cash — cyan
  indigo: '#4a3aa8', // salary — deep indigo
  violet: '#8a5cf0', // fixed deposit — lighter violet
};

export default function StampBadge({ icon: Icon, color = 'blue', size = 38 }) {
  const bg = FILL[color] ?? FILL.blue;

  return (
    <span
      className="stamp-badge inline-flex shrink-0 items-center justify-center rounded-md"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      {Icon && <Icon size={Math.round(size * 0.5)} color="#ffffff" strokeWidth={2} />}
    </span>
  );
}