import { useState } from "react";
import Badge from "./ui/Badge";
import Card from "./ui/Card";

export interface TaskItem {
  id: string;
  title: string;
  body: string;
  completed?: boolean;
}

interface TaskDetailProps {
  task: TaskItem;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

export default function TaskDetail({ task, onToggleComplete }: TaskDetailProps) {
  const [isChecked, setIsChecked] = useState(Boolean(task.completed));

  function handleToggle() {
    const newState = !isChecked;

    setIsChecked(newState);
    onToggleComplete?.(task.id, newState);
  }

  return (
    <Card
      title={task.title}
      subtitle={task.body}
      actions={<Badge label={isChecked ? "Concluida" : "Em andamento"} tone={isChecked ? "success" : "warning"} />}
      className="border-l-4 border-l-primary-400"
    >
      <label className="inline-flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-900"
        />
        Marcar como concluida
      </label>
    </Card>
  );
}
