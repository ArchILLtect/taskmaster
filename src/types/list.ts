// Stable UI-level list type (do not depend on generated API model types)
export type ListUI = {
  id: string;
  name: string;
  description?: string | null;

  isFavorite: boolean;
  sortOrder: number;

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export type ListItem = {
  id: string;
  name: string;
  description?: string | null;
  isFavorite: boolean;
  sortOrder: number;
};

export type ListRowProps = {
  list: ListUI;
  to: string;
  setSelectedList?: (listId: string) => void;
  isEditing?: boolean;
  setIsEditing?: (isEditing: boolean) => void;
  isActive: boolean;
  isEditable?: boolean;
  onDelete?: (listId: string) => Promise<void>;
  onToggleFavorite?: (listId: string, isFavorite: boolean) => Promise<void> | void;
};

export type AddListFormProps = {
  list?: ListUI;
  newListName: string;
  setNewListName: (name: string) => void;
  newListDescription: string;
  setNewListDescription: (description: string) => void;
  saving: boolean;
  onCreate: () => Promise<void>;
  onCancel: () => void;
};

export type EditListFormProps = {
  list?: ListUI;
  draftName: string;
  setDraftName: (name: string) => void;
  draftDescription: string;
  setDraftDescription: (description: string) => void;
  saving: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
};
