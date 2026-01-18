/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTaskListInput = {
  id?: string | null,
  name: string,
  isFavorite: boolean,
  sortOrder: number,
};

export type ModelTaskListConditionInput = {
  name?: ModelStringInput | null,
  isFavorite?: ModelBooleanInput | null,
  sortOrder?: ModelIntInput | null,
  and?: Array< ModelTaskListConditionInput | null > | null,
  or?: Array< ModelTaskListConditionInput | null > | null,
  not?: ModelTaskListConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type TaskList = {
  __typename: "TaskList",
  id: string,
  name: string,
  isFavorite: boolean,
  sortOrder: number,
  tasks?: ModelTaskConnection | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type ModelTaskConnection = {
  __typename: "ModelTaskConnection",
  items:  Array<Task | null >,
  nextToken?: string | null,
};

export type Task = {
  __typename: "Task",
  id: string,
  listId: string,
  sortOrder: number,
  parentTaskId?: string | null,
  title: string,
  description?: string | null,
  status: TaskStatus,
  priority: TaskPriority,
  dueAt?: string | null,
  completedAt?: string | null,
  assigneeId?: string | null,
  tagIds: Array< string >,
  list?: TaskList | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export enum TaskStatus {
  Open = "Open",
  Done = "Done",
}


export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}


export type UpdateTaskListInput = {
  id: string,
  name?: string | null,
  isFavorite?: boolean | null,
  sortOrder?: number | null,
};

export type DeleteTaskListInput = {
  id: string,
};

export type CreateTaskInput = {
  id?: string | null,
  listId: string,
  sortOrder: number,
  parentTaskId?: string | null,
  title: string,
  description?: string | null,
  status: TaskStatus,
  priority: TaskPriority,
  dueAt?: string | null,
  completedAt?: string | null,
  assigneeId?: string | null,
  tagIds: Array< string >,
};

export type ModelTaskConditionInput = {
  listId?: ModelIDInput | null,
  sortOrder?: ModelIntInput | null,
  parentTaskId?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  status?: ModelTaskStatusInput | null,
  priority?: ModelTaskPriorityInput | null,
  dueAt?: ModelStringInput | null,
  completedAt?: ModelStringInput | null,
  assigneeId?: ModelStringInput | null,
  tagIds?: ModelStringInput | null,
  and?: Array< ModelTaskConditionInput | null > | null,
  or?: Array< ModelTaskConditionInput | null > | null,
  not?: ModelTaskConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelTaskStatusInput = {
  eq?: TaskStatus | null,
  ne?: TaskStatus | null,
};

export type ModelTaskPriorityInput = {
  eq?: TaskPriority | null,
  ne?: TaskPriority | null,
};

export type UpdateTaskInput = {
  id: string,
  listId?: string | null,
  sortOrder?: number | null,
  parentTaskId?: string | null,
  title?: string | null,
  description?: string | null,
  status?: TaskStatus | null,
  priority?: TaskPriority | null,
  dueAt?: string | null,
  completedAt?: string | null,
  assigneeId?: string | null,
  tagIds?: Array< string > | null,
};

export type DeleteTaskInput = {
  id: string,
};

export type ModelTaskListFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  isFavorite?: ModelBooleanInput | null,
  sortOrder?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTaskListFilterInput | null > | null,
  or?: Array< ModelTaskListFilterInput | null > | null,
  not?: ModelTaskListFilterInput | null,
  owner?: ModelStringInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelTaskListConnection = {
  __typename: "ModelTaskListConnection",
  items:  Array<TaskList | null >,
  nextToken?: string | null,
};

export type ModelTaskFilterInput = {
  id?: ModelIDInput | null,
  listId?: ModelIDInput | null,
  sortOrder?: ModelIntInput | null,
  parentTaskId?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  status?: ModelTaskStatusInput | null,
  priority?: ModelTaskPriorityInput | null,
  dueAt?: ModelStringInput | null,
  completedAt?: ModelStringInput | null,
  assigneeId?: ModelStringInput | null,
  tagIds?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTaskFilterInput | null > | null,
  or?: Array< ModelTaskFilterInput | null > | null,
  not?: ModelTaskFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelIntKeyConditionInput = {
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelSubscriptionTaskListFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  isFavorite?: ModelSubscriptionBooleanInput | null,
  sortOrder?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTaskListFilterInput | null > | null,
  or?: Array< ModelSubscriptionTaskListFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionTaskFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  listId?: ModelSubscriptionIDInput | null,
  sortOrder?: ModelSubscriptionIntInput | null,
  parentTaskId?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  priority?: ModelSubscriptionStringInput | null,
  dueAt?: ModelSubscriptionStringInput | null,
  completedAt?: ModelSubscriptionStringInput | null,
  assigneeId?: ModelSubscriptionStringInput | null,
  tagIds?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTaskFilterInput | null > | null,
  or?: Array< ModelSubscriptionTaskFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type CreateTaskListMutationVariables = {
  input: CreateTaskListInput,
  condition?: ModelTaskListConditionInput | null,
};

export type CreateTaskListMutation = {
  createTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateTaskListMutationVariables = {
  input: UpdateTaskListInput,
  condition?: ModelTaskListConditionInput | null,
};

export type UpdateTaskListMutation = {
  updateTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteTaskListMutationVariables = {
  input: DeleteTaskListInput,
  condition?: ModelTaskListConditionInput | null,
};

export type DeleteTaskListMutation = {
  deleteTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateTaskMutationVariables = {
  input: CreateTaskInput,
  condition?: ModelTaskConditionInput | null,
};

export type CreateTaskMutation = {
  createTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateTaskMutationVariables = {
  input: UpdateTaskInput,
  condition?: ModelTaskConditionInput | null,
};

export type UpdateTaskMutation = {
  updateTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteTaskMutationVariables = {
  input: DeleteTaskInput,
  condition?: ModelTaskConditionInput | null,
};

export type DeleteTaskMutation = {
  deleteTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetTaskListQueryVariables = {
  id: string,
};

export type GetTaskListQuery = {
  getTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListTaskListsQueryVariables = {
  id?: string | null,
  filter?: ModelTaskListFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListTaskListsQuery = {
  listTaskLists?:  {
    __typename: "ModelTaskListConnection",
    items:  Array< {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetTaskQueryVariables = {
  id: string,
};

export type GetTaskQuery = {
  getTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListTasksQueryVariables = {
  id?: string | null,
  filter?: ModelTaskFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListTasksQuery = {
  listTasks?:  {
    __typename: "ModelTaskConnection",
    items:  Array< {
      __typename: "Task",
      id: string,
      listId: string,
      sortOrder: number,
      parentTaskId?: string | null,
      title: string,
      description?: string | null,
      status: TaskStatus,
      priority: TaskPriority,
      dueAt?: string | null,
      completedAt?: string | null,
      assigneeId?: string | null,
      tagIds: Array< string >,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TasksByListQueryVariables = {
  listId: string,
  sortOrder?: ModelIntKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTaskFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TasksByListQuery = {
  tasksByList?:  {
    __typename: "ModelTaskConnection",
    items:  Array< {
      __typename: "Task",
      id: string,
      listId: string,
      sortOrder: number,
      parentTaskId?: string | null,
      title: string,
      description?: string | null,
      status: TaskStatus,
      priority: TaskPriority,
      dueAt?: string | null,
      completedAt?: string | null,
      assigneeId?: string | null,
      tagIds: Array< string >,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TasksByParentQueryVariables = {
  parentTaskId: string,
  sortOrder?: ModelIntKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTaskFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TasksByParentQuery = {
  tasksByParent?:  {
    __typename: "ModelTaskConnection",
    items:  Array< {
      __typename: "Task",
      id: string,
      listId: string,
      sortOrder: number,
      parentTaskId?: string | null,
      title: string,
      description?: string | null,
      status: TaskStatus,
      priority: TaskPriority,
      dueAt?: string | null,
      completedAt?: string | null,
      assigneeId?: string | null,
      tagIds: Array< string >,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTaskListSubscriptionVariables = {
  filter?: ModelSubscriptionTaskListFilterInput | null,
  owner?: string | null,
};

export type OnCreateTaskListSubscription = {
  onCreateTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateTaskListSubscriptionVariables = {
  filter?: ModelSubscriptionTaskListFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTaskListSubscription = {
  onUpdateTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteTaskListSubscriptionVariables = {
  filter?: ModelSubscriptionTaskListFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTaskListSubscription = {
  onDeleteTaskList?:  {
    __typename: "TaskList",
    id: string,
    name: string,
    isFavorite: boolean,
    sortOrder: number,
    tasks?:  {
      __typename: "ModelTaskConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null,
  owner?: string | null,
};

export type OnCreateTaskSubscription = {
  onCreateTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTaskSubscription = {
  onUpdateTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteTaskSubscriptionVariables = {
  filter?: ModelSubscriptionTaskFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTaskSubscription = {
  onDeleteTask?:  {
    __typename: "Task",
    id: string,
    listId: string,
    sortOrder: number,
    parentTaskId?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    dueAt?: string | null,
    completedAt?: string | null,
    assigneeId?: string | null,
    tagIds: Array< string >,
    list?:  {
      __typename: "TaskList",
      id: string,
      name: string,
      isFavorite: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
