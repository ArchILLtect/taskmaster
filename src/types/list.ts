export type TaskList = {
  id: string;
  name: string;
  description?: string;

  isFavorite: boolean;

  sortOrder: number; // sidebar ordering
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export type ListItem = {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  sortOrder: number;
};

export type ListRowProps = {
  list: TaskList;
  to: string;
  setSelectedList: (listId: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isActive: boolean;
  onDelete?: (listId: string) => Promise<void>;
  onToggleFavorite?: (listId: string, isFavorite: boolean) => Promise<void>;
};

export type AddListFormProps = {
  list?: TaskList;
  newListName: string;
  setNewListName: (name: string) => void;
  newListDescription: string;
  setNewListDescription: (description: string) => void;
  setShowAddListForm?: (show: boolean) => void;
  navigate: (path: string) => void;
  refresh: () => Promise<void>;
};

export type EditListFormProps = {
  list?: TaskList;
  draftName: string;
  setDraftName: (name: string) => void;
  draftDescription: string;
  setDraftDescription: (description: string) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  onClose: () => void;
  onChanged?: () => void;
  refresh: () => Promise<void>;
};
