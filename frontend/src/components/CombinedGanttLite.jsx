import GanttLite from './GanttLite';

export default function CombinedGanttLite({ plan, tasks }) {
  const items = [
    ...(plan||[]).map(p => ({ _id: `p-${p._id}`, title: `PLAN: ${p.title}`, startDate: p.startDate, dueDate: p.dueDate })),
    ...(tasks||[]).map(t => ({ _id: `t-${t._id}`, title: `TASK: ${t.title}`, startDate: t.startDate, dueDate: t.dueDate }))
  ];
  return <GanttLite items={items} color="#000" />;
}
