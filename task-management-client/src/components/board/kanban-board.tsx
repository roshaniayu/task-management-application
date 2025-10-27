import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./board-column";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  type Announcements,
  type UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { type Task, TaskCard } from "./task-card";
import type { Column } from "./board-column";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multiple-containers-keyboard-preset";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/api";
import type { TaskResponse, TaskPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";

export const columnToStatus: Record<ColumnId, "TODO" | "IN_PROGRESS" | "DONE"> = {
  "todo": "TODO",
  "in-progress": "IN_PROGRESS",
  "done": "DONE",
};

export const statusToColumn: Record<"TODO" | "IN_PROGRESS" | "DONE", ColumnId> = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

const defaultCols = [
  {
    id: "todo" as const,
    title: "To Do",
  },
  {
    id: "in-progress" as const,
    title: "In Progress",
  },
  {
    id: "done" as const,
    title: "Done",
  },
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]["id"];

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Add Task modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEndDate, setNewEndDate] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreateTask() {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDescription ? newDescription.trim() : null,
        endDate: newEndDate ? new Date(newEndDate).toISOString() : null,
        status: "TODO"
      } as const;

      const created = await createTask(payload as any);

      const mapped: Task = {
        id: String(created.id),
        columnId: statusToColumn[created.status] ?? "todo",
        title: created.title,
        description: created.description ?? undefined,
        endDate: created.endDate ?? null,
        owner: created.owner,
        createdAt: created.createdAt,
      } as Task;

      setTasks((t) => [mapped, ...t]);
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewEndDate(undefined);
    } catch (err) {
      console.error("Failed to create task:", err);
      // Could show an error toast here
    } finally {
      setIsSaving(false);
    }
  }

  const handleEditTask = async (taskId: UniqueIdentifier, updates: TaskPayload) => {
    try {
      updates.endDate = updates.endDate ? new Date(updates.endDate).toISOString() : null;

      const updated = await updateTask(String(taskId), updates);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...updated, columnId: statusToColumn[updated.status] } as Task
            : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      setLoadError('Failed to update task. Please try again.');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: UniqueIdentifier) => {
    try {
      await deleteTask(String(taskId));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setLoadError('Failed to delete task. Please try again.');
    }
  };

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const serverTasks: TaskResponse[] = await fetchTasks();

        const mapped: Task[] = serverTasks.map((t) => {

          const columnId = (statusToColumn[t.status] ?? "todo") as ColumnId;
          const title = t.title;
          const description = t.description ?? null;
          const endDate = t.endDate ?? null;
          const owner = t.owner;
          const createdAt = t.createdAt;

          return {
            id: String(t.id),
            columnId,
            title,
            description,
            endDate,
            owner,
            createdAt
          } satisfies Task;
        });

        setTasks(mapped);
      } catch (err: any) {
        console.error("Failed to load tasks:", err);
        setLoadError(err?.message || String(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = columns.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${startColumnIdx + 1
          } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.columnId;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current
        );
        return `Picked up Task ${active.data.current.task.title
          } at position: ${taskPosition + 1} of ${tasksInColumn.length
          } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${over.data.current.column.title
          } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${active.data.current.task.title
            } was moved over column ${column?.title} in position ${taskPosition + 1
            } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${tasksInColumn.length
          } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${active.data.current.column.title
          } was dropped into position ${overColumnPosition + 1} of ${columnsId.length
          }`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${taskPosition + 1
            } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${tasksInColumn.length
          } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      {isLoading && (
        <div className="mb-4 text-sm text-muted-foreground">Loading tasks...</div>
      )}
      {loadError && (
        <div className="mb-4 text-sm text-red-500">Failed to load tasks: {loadError}</div>
      )}

      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            col.id === "todo" ? (
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-600"
                  >
                    <Plus className="mr-2" size={16} /> New Task
                  </Button>
                </div>
                <BoardColumn
                  key={col.id}
                  column={col}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </div>
            ) : (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            )
          ))}
        </SortableContext>
      </BoardContainer>

      <AlertDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Task</AlertDialogTitle>
            <AlertDialogDescription>
              Add a title (required) and optional details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="newTitle" className="text-sm font-medium">Title *</label>
              <Input
                id="newTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="newDescription" className="text-sm font-medium">Description</label>
              <Input
                id="newDescription"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task description"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="newEndDate" className="text-sm font-medium">End Date</label>
              <Input
                id="newEndDate"
                type="date"
                value={newEndDate ?? ""}
                onChange={(e) => setNewEndDate(e.target.value || undefined)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving || !newTitle.trim()}
              onClick={handleCreateTask}
            >
              {isSaving ? "Creating..." : "Create Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {
        "document" in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )
      }
    </DndContext >
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    const activeTask = active.data.current?.task as Task;
    const newStatus = columnToStatus[activeTask.columnId as ColumnId];
    updateTask(String(activeTask.id), {
      title: activeTask.title,
      description: activeTask.description,
      endDate: activeTask.endDate,
      status: newStatus as "TODO" | "IN_PROGRESS" | "DONE"
    }).catch((error) => {
      console.error('Error updating task status:', error);
    });


    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (
          activeTask &&
          overTask &&
          activeTask.columnId !== overTask.columnId
        ) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId as ColumnId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }
}
