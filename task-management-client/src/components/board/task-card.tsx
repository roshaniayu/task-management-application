import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import { GripVertical, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { type ColumnId } from "./kanban-board";

export interface Task {
  id: UniqueIdentifier;
  columnId: ColumnId;
  title: string;
  description: string | null;
  endDate: string | null;
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatDate = (d: Date) => `${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}/${d.getFullYear()}`;

  // compute end date badge status (red if past, yellow if within 3 days, green otherwise)
  const endDateObj = task.endDate ? new Date(task.endDate) : null;
  const now = new Date();
  let endBadgeClass = "";
  let endBadgeLabel = "";
  if (endDateObj) {
    const diffMs = endDateObj.getTime() - now.getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    if (diffMs < 0) {
      // past -> red
      endBadgeClass = "bg-red-600 text-white border-transparent dark:bg-red-500";
      endBadgeLabel = formatDate(endDateObj);
    } else if (diffMs <= threeDaysMs) {
      // within 3 days -> yellow
      endBadgeClass = "bg-yellow-400 text-black border-transparent dark:bg-yellow-500";
      endBadgeLabel = formatDate(endDateObj);
    } else {
      // future (more than 3 days) -> green
      endBadgeClass = "bg-green-600 text-white border-transparent dark:bg-green-500";
      endBadgeLabel = formatDate(endDateObj);
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
        >
          <span className="sr-only">Move task</span>
          <GripVertical />
        </Button>
        <Badge variant={"secondary"} className="ml-auto text-muted-foreground">
          TSK-{task.id}
        </Badge>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left flex flex-col gap-2">
        <div className="font-medium whitespace-pre-wrap">{task.title}</div>
        {task.description && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {task.description}
          </div>
        )}
        {endDateObj && (
          <div className="mt-1 flex justify-end">
            <Badge variant={"outline"} className={"flex items-center px-2 " + endBadgeClass}>
              <Calendar className="w-3 h-3 mr-2" />
              {endBadgeLabel}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-3 py-2">
        <div className="text-xs text-muted-foreground">Created on: {formatDate(new Date(task.createdAt))}</div>
      </CardFooter>
    </Card>
  );
}
