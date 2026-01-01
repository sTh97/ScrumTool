import GanttLite from './GanttLite';

export default function TaskGanttLite({ tasks }) {
  const items = (tasks||[]).map(t => ({
    _id: t._id,
    title: `${t.title} [${t.status}]`,
    startDate: t.startDate,
    dueDate: t.dueDate
  }));
  return <GanttLite items={items} color="#444" />;
}
