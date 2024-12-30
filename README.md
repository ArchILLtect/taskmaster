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
    - Add user authentication to secure task and group data.
    - Enhance UI/UX with additional animations and themes.
    - Implement drag-and-drop task ordering.
    - Provide analytics for task completion rates.

    Coming Soon:
        - Cascade delete tasks on group delete
        - Priorities
        - Task dates
        - Subtasks
        - Mark tasks as completed

## License

    This project is licensed under the MIT License.

## Contributors

    - Nick Hanson Sr.
    - ChatGPT 4.0/o1
