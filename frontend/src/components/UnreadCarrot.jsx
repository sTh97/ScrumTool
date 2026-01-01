export default function UnreadCarrot({ count }) {
  if (!count) return null;
  return (
    <span className="ml-2 inline-flex items-center justify-center text-xs bg-black text-white rounded-full w-5 h-5">
      {count}
    </span>
  );
}
