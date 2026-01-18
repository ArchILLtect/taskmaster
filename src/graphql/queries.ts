/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTaskList = /* GraphQL */ `query GetTaskList($id: ID!) {
  getTaskList(id: $id) {
    id
    name
    isFavorite
    sortOrder
    tasks {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTaskListQueryVariables,
  APITypes.GetTaskListQuery
>;
export const listTaskLists = /* GraphQL */ `query ListTaskLists(
  $id: ID
  $filter: ModelTaskListFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listTaskLists(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      name
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTaskListsQueryVariables,
  APITypes.ListTaskListsQuery
>;
export const getTask = /* GraphQL */ `query GetTask($id: ID!) {
  getTask(id: $id) {
    id
    listId
    sortOrder
    parentTaskId
    title
    description
    status
    priority
    dueAt
    completedAt
    assigneeId
    tagIds
    list {
      id
      name
      isFavorite
      sortOrder
      createdAt
      updatedAt
      owner
      __typename
    }
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTaskQueryVariables, APITypes.GetTaskQuery>;
export const listTasks = /* GraphQL */ `query ListTasks(
  $id: ID
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listTasks(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      listId
      sortOrder
      parentTaskId
      title
      description
      status
      priority
      dueAt
      completedAt
      assigneeId
      tagIds
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTasksQueryVariables, APITypes.ListTasksQuery>;
export const tasksByListIdAndSortOrder = /* GraphQL */ `query TasksByListIdAndSortOrder(
  $listId: ID!
  $sortOrder: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  tasksByListIdAndSortOrder(
    listId: $listId
    sortOrder: $sortOrder
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      listId
      sortOrder
      parentTaskId
      title
      description
      status
      priority
      dueAt
      completedAt
      assigneeId
      tagIds
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TasksByListIdAndSortOrderQueryVariables,
  APITypes.TasksByListIdAndSortOrderQuery
>;
export const tasksByParentTaskIdAndSortOrder = /* GraphQL */ `query TasksByParentTaskIdAndSortOrder(
  $parentTaskId: ID!
  $sortOrder: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  tasksByParentTaskIdAndSortOrder(
    parentTaskId: $parentTaskId
    sortOrder: $sortOrder
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      listId
      sortOrder
      parentTaskId
      title
      description
      status
      priority
      dueAt
      completedAt
      assigneeId
      tagIds
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TasksByParentTaskIdAndSortOrderQueryVariables,
  APITypes.TasksByParentTaskIdAndSortOrderQuery
>;
