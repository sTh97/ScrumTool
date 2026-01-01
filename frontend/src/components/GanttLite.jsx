import { toDMY } from '../utils/date';

export default function GanttLite({ items, color = '#111' }) {
  if (!items?.length) return <div className="text-sm text-gray-500">No items.</div>;

  const dates = items.flatMap(i => [new Date(i.startDate || i.dueDate), new Date(i.dueDate || i.startDate)]);
  const min = new Date(Math.min(...dates.map(Number)));
  const max = new Date(Math.max(...dates.map(Number)));
  const span = Math.max(1, (max - min) / (1000*3600*24));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {items.map(i => {
          const s = new Date(i.startDate || i.dueDate);
          const e = new Date(i.dueDate || i.startDate);
          const left = ((s - min) / (1000*3600*24)) / span * 100;
          const width = Math.max(1, ((e - s) / (1000*3600*24)) / span * 100);
          return (
            <div key={i._id} className="mb-3">
              <div className="text-sm font-medium">{i.title} <span className="text-gray-500 ml-2">{toDMY(i.startDate)} → {toDMY(i.dueDate)}</span></div>
              <div className="h-3 bg-gray-200 rounded relative">
                <div className="absolute h-3 rounded" style={{ left: `${left}%`, width: `${width}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
