import { useState, useEffect } from "react";
import { type ColumnId, columnToStatus } from "./kanban-board";
import { getUsernames, type UpdateTaskPayload } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { GripVertical, Calendar, Trash2, Pencil, User } from "lucide-react";
import { toast } from "sonner";

export interface Task {
  id: UniqueIdentifier;
  columnId: ColumnId;
  title: string;
  description: string | null;
  endDate: string | null;
  owner: string;
  createdAt: string;
  assignees: string[];
}

export interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete?: (taskId: UniqueIdentifier) => void;
  onEdit?: (taskId: UniqueIdentifier, updates: UpdateTaskPayload) => Promise<void>;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete?: (taskId: UniqueIdentifier) => void;
}

export function TaskCard({ task, isOverlay, onDelete, onEdit }: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editEndDate, setEditEndDate] = useState(task.endDate?.split('T')[0] || "");
  const [editStatus, setEditStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">(columnToStatus[task.columnId]);
  const [editAssignees, setEditAssignees] = useState<string[]>(task.assignees || []);
  const [users, setUsers] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      if (!isEditDialogOpen) return;
      setIsLoadingUsers(true);

      try {
        const result = await getUsernames();
        setUsers(result.usernames || []);
      } catch (error: any) {
        toast.error(`Error: ${error?.message || String(error)}. Please try again later.`);
        throw error;
      } finally {
        setIsLoadingUsers(false);
      }
    }
    loadUsers();
  }, [isEditDialogOpen]);

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

  // Compute end date badge status (red if past, yellow if within 3 days, green otherwise)
  const endDateObj = task.endDate ? new Date(task.endDate) : null;
  const now = new Date();
  let endBadgeClass = "";
  let endBadgeLabel = "";
  if (endDateObj) {
    const diffMs = endDateObj.getTime() - now.getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    if (diffMs < 0) {
      // Past -> red
      endBadgeClass = "bg-red-600 text-white border-transparent dark:bg-red-600";
      endBadgeLabel = formatDate(endDateObj);
    } else if (diffMs <= threeDaysMs) {
      // Within 3 days -> yellow
      endBadgeClass = "bg-yellow-400 text-black border-transparent dark:bg-yellow-500";
      endBadgeLabel = formatDate(endDateObj);
    } else {
      // Future (more than 3 days) -> green
      endBadgeClass = "bg-green-600 text-white border-transparent dark:bg-green-600";
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
        <p > </p>
        <div className="ml-auto flex gap-2">
          {task.assignees && task.owner !== getAuth().username && (
            <Badge variant="outline" className="text-muted-foreground">
              Assigned
            </Badge>
          )}
          <Badge variant={"secondary"} className="text-muted-foreground">
            TSK-{task.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-4 text-left flex flex-col gap-2">
        <div className="font-medium whitespace-pre-wrap">{task.title}</div>
        {task.description && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {task.description}
          </div>
        )}
        <div className="mt-1 flex items-center gap-1">
          {endDateObj && (
            <Badge variant={"outline"} className={"flex items-center px-2 " + endBadgeClass}>
              <Calendar className="w-3 h-3 mr-1" />
              {endBadgeLabel}
            </Badge>
          )}
          {task.assignees && task.assignees.length > 0 && (
            <Badge variant={"secondary"} className="flex items-center px-2 max-w-[200px]">
              <User className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="font-bold mr-1 flex-shrink-0">{task.assignees.length}</span>
              <span className="text-muted-foreground truncate">{task.assignees.map(assignee => `@${assignee}`).join(', ')}</span>
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-3 py-2 flex justify-between items-center">
        <div className="flex flex-col gap-1 items-start">
          <div className="text-xs text-muted-foreground">Owner: @{task.owner}</div>
          <div className="text-xs text-muted-foreground">Created on: {formatDate(new Date(task.createdAt))}</div>
        </div>
        <div className="flex gap-1">
          {task.assignees && task.owner === getAuth().username && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete task</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await onDelete?.(task.id);
                      } finally {
                        setIsDeleting(false);
                        setIsDeleteDialogOpen(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={() => setIsEditDialogOpen(true)}
                disabled={isEditing}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Update the task details below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-sm font-medium">Title *</label>
                  <Input
                    id="title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Task description"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={editStatus}
                    onValueChange={(value: "TODO" | "IN_PROGRESS" | "DONE") => setEditStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">Todo</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Assignee(s)</label>
                  <MultiSelectCombobox
                    options={users}
                    selected={editAssignees}
                    onChange={setEditAssignees}
                    placeholder={isLoadingUsers ? "Loading users..." : "Select assignees..."}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isEditing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isEditing || !editTitle.trim()}
                  onClick={async () => {
                    const trimmedTitle = editTitle.trim();
                    if (!onEdit || !trimmedTitle) return;
                    setIsEditing(true);
                    try {
                      await onEdit(task.id, {
                        title: trimmedTitle,
                        description: editDescription.trim() || null,
                        endDate: editEndDate || null,
                        status: editStatus,
                        assignees: editAssignees
                      });
                      setIsEditDialogOpen(false);
                    } finally {
                      setIsEditing(false);
                    }
                  }}
                >
                  {isEditing ? "Saving..." : "Save changes"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
