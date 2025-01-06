# TaskMaster

    TaskMaster is a modern and intuitive task management web application built using React, TailwindCSS, AWS Lambda, and DynamoDB. It allows users to create, manage, and organize tasks into customizable groups.

## Features

    - **Task Management**: Add, view, and delete tasks.
    - **Group Management**: Create, delete, and organize tasks within groups.
    - **Dynamic UI**: Smooth and responsive design with TailwindCSS.
    - **Scroll Overflow Management**: Interactive arrows for navigating grouped tasks when they overflow.
    - **Backend Integration**: Serverless API endpoints built with AWS Lambda and DynamoDB.

## Technologies Used

    - **Frontend**: React, TailwindCSS
    - **Backend**: AWS Lambda, DynamoDB
    - **Deployment**: Netlify
    - **Styling**: TailwindCSS with plugins for scrollbars
    - **State Management**: React hooks

## Setup

### Prerequisites
    - Node.js and npm installed on your system.
    - AWS account with permissions to use Lambda and DynamoDB.
    - Netlify account for deployment.

### Installation

    1. Clone the repository:
        git clone https://github.com/yourusername/taskmaster.git
        cd taskmaster

    2. Install dependencies:
        npm install

    3. Configure AWS Lambda endpoints in api.js: Update the base URLs to your deployed Lambda functions for tasks and groups.

    4. Run the development server:
        npm start

    5. Build for production:
        npm run build

### TailwindCSS Configuration

    TailwindCSS is configured in the tailwind.config.js file. Plugins like tailwind-scrollbar are included for enhanced UI styling.
    Check the file for details:

    /** @type {import('tailwindcss').Config} */
    module.exports = {
        content: [
            "./src/**/*.{js,jsx,ts,tsx}",
        ],
        theme: {
            extend: {},
        },
        plugins: [
            require('tailwind-scrollbar'),
        ],
    };

### Deployment

    1. Push your code to GitHub.
    2. Connect your repository to Netlify.
    3. Configure environment variables on Netlify if needed.
    4. Deploy the app.

## Project Structure

    - src/components: Contains reusable React components like TaskForm, TaskList, TabBar, and GroupManager.
    - src/services: API service files (api.js and groupService.js) for interacting with Lambda and DynamoDB.
    - src/App.js: Main app component that orchestrates the UI and logic.
    - tailwind.config.js: TailwindCSS configuration.

## Future Enhancements
    - Enhance UI/UX with additional animations and themes.
    - Implement drag-and-drop task ordering.
    - Provide analytics for task completion rates.
    - Offline mode! Will leverage indexedDB (and a library like Dexie.js to make IndexedDB easier to use?)

### Coming Soon:
    - Important bug fix: need a check for currentUser (local storage) against logged in user
        (Auth0User.sub). No match = clear and reinitialize.
    - User Feedback for Dialog Actions: When users perform actions like saving a task or renaming
        a group, provide a small notification or feedback (e.g., a toast message) confirming success.
    - Form Validations: Validate task or group inputs in the dialogs to ensure no blank or duplicate entries are allowed.
    - Priorities (Starring)
    - Task dates (created on)
    - Subtasks
    - Task status = Mark tasks as completed
    - Fix error reporting for trying to add a group named General - Done, but needs bug check.

### Validation/UI-UX:
    - Input Validation: Enhance form validation in components like TaskForm and RenameGroupDialog to prevent empty
        or invalid inputs from being submitted.
    - Consider visual feedback for long-running tasks, such as showing a spinner or disabling buttons during
        uploads or API calls.

### Accessibility:
    - TabBar Overflow Arrows: Ensure that the arrows for scrolling the TabBar are accessible via keyboard
        navigation for users who rely on it.
    - Feedback: Add success or error messages for actions like task addition or deletion to improve user experience.

### SubTasks:
    - Cascading Operations: Ensure that subtasks are deleted or reassigned when their parent task is deleted.
        When completing a parent task, automatically mark subtasks as complete (if desired).

    - Subtask Ordering: Add an order or position field to subtasks to allow manual reordering.
        Use drag-and-drop UI components for arranging subtasks.

    - Nested Subtasks (Optional): Add support for multilevel nesting by allowing subtasks to also act as parents.
        Use a recursive function to render tasks and subtasks dynamically in the UI.

    - Custom Subtask Views: Provide different views for tasks and subtasks (e.g., a collapsible tree, Kanban board).
    - Performance Optimizations: Group tasks and subtasks in the backend if you expect performance
        bottlenecks in the frontend.

### Authentication:
    - Add user authentication to secure task and group data.
    - Add functionality for updating profile options.
    - Implement role-based access control for user actions using the audience parameter provided by Auth0
        to restrict certain functionalities based on roles.

### Error Handling:
    - Centralize error handling for API requests to avoid duplicating console.error() and improve maintainability.

### Testing:
    - Incorporate unit tests for critical components and integration tests for end-to-end flows
        (e.g., adding a group and assigning tasks).

### Performance:
    - Optimize task and group state updates to reduce re-renders by utilizing useMemo or useCallback where applicable.
    - Consider lazy loading components like ProfilePicUploader and modals to reduce the initial bundle size.

## License

    This project is licensed under the MIT License.

## Contributors

    - Nick Hanson Sr.
    - ChatGPT 4.0/o1
