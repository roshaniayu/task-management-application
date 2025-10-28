import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BoardColumn, BoardContainer, type Column } from "./board-column";
import { type Task, TaskCard } from "./task-card";
import { ShareButton } from "./share-button";
import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multiple-containers-keyboard-preset";
import { getAuth } from "@/lib/auth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getUsernames,
  type GetTaskResponse,
  type TaskPayload
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"
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
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Announcements,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
  const [error, setError] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Add task modal state
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
        status: "TODO",
        assignees: selectedAssignees.length > 0 ? selectedAssignees : undefined
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
      setSelectedAssignees([]);
    } catch (error: any) {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  const handleEditTask = async (taskId: UniqueIdentifier, updates: TaskPayload) => {
    try {
      updates.endDate = updates.endDate ? new Date(updates.endDate).toISOString() : null;

      const updated = await updateTask(String(taskId), updates);

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...updated,
              columnId: statusToColumn[updated.status]
            } as Task
            : task
        );

        const currentUser = getAuth().username;
        return currentUser
          ? updatedTasks.filter(task =>
            task.id === taskId
              ? (updated.assignees || []).includes(currentUser) || task.owner === currentUser
              : (task.assignees || []).includes(currentUser) || task.owner === currentUser
          )
          : updatedTasks;
      });
    } catch (error: any) {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: UniqueIdentifier) => {
    try {
      await deleteTask(String(taskId));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error: any) {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
      throw error;
    }
  };

  const onClickCreateTask = async () => {
    setIsCreateOpen(true);
    setSelectedAssignees([]);
    setIsLoadingUsers(true);

    try {
      const result = await getUsernames();
      setUsers(result.usernames || []);
    } catch (error: any) {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
      setUsers([]);
      throw error;
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const result: GetTaskResponse = await getTasks();

        const mapped: Task[] = result.tasks.map((t) => {
          const columnId = (statusToColumn[t.status] ?? "todo") as ColumnId;
          const title = t.title;
          const description = t.description ?? null;
          const endDate = t.endDate ?? null;
          const owner = t.owner;
          const createdAt = t.createdAt;
          const assignees = t.assignees;

          return {
            id: String(t.id),
            columnId,
            title,
            description,
            endDate,
            owner,
            createdAt,
            assignees
          } satisfies Task;
        });

        setTasks(mapped);
      } catch (error: any) {
        setError(error?.message || String(error));
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
      {isLoading ? (
        <div className="px-2 md:px-0 flex lg:justify-center">
          <div className="flex flex-row gap-4 items-end justify-center">
            {columns.map((col) => (
              col.id === "todo" ? (
                <div className="flex flex-col gap-2" key={col.id}>
                  <div className="flex">
                    <Skeleton className="h-10 w-30" />
                  </div>
                  <Skeleton className="h-[580px] max-h-[580px] w-[350px] mb-4" />
                </div>
              ) : (
                <Skeleton className="h-[580px] max-h-[580px] w-[350px] mb-4" />
              )
            ))}
          </div>
        </div>
      ) : (error ? (
        <div className="px-2 md:px-0 flex lg:justify-center">
          <div className="h-[640px] max-h-[640px] flex flex-col gap-4 items-center justify-center max-w-md text-center">
            <h3 className="text-xl font-semibold">⚠️ Unable to Load Tasks</h3>
            <p className="text-muted-foreground">Error: {error}. Please try again later.</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <BoardContainer>
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              col.id === "todo" || col.id === "done" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    {col.id === "todo" ? (
                      <Button
                        onClick={onClickCreateTask}
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        <Plus className="mr-2" size={16} /> New Task
                      </Button>
                    ) : (
                      <ShareButton />
                    )}
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
      ))
      }

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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Assignee(s)</label>
              <MultiSelectCombobox
                options={users}
                selected={selectedAssignees}
                onChange={setSelectedAssignees}
                placeholder={isLoadingUsers ? "Loading users..." : "Select assignees..."}
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
        "document" in window && createPortal(
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
    }).catch((error: any) => {
      toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
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

    // Dropping a task over another task
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

    // Dropping a task over a column
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
