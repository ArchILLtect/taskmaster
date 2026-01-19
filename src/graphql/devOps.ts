export const createTaskListMinimal = /* GraphQL */ `
  mutation CreateTaskList($input: CreateTaskListInput!) {
    createTaskList(input: $input) {
      id
      name
      isFavorite
      sortOrder
      owner
      createdAt
      updatedAt
    }
  }
`;

export const createTaskMinimal = /* GraphQL */ `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
      owner
      createdAt
      updatedAt
    }
  }
`;