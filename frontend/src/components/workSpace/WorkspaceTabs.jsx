// src/pages/ProjectWorkspace/components/WorkspaceTabs.jsx
export default function WorkspaceTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={
              "whitespace-nowrap px-3 py-1.5 text-sm rounded-full border transition" +
              (isActive
                ? " bg-slate-900 text-white border-slate-900"
                : " bg-white text-slate-700 border-slate-300 hover:bg-slate-100")
            }
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
