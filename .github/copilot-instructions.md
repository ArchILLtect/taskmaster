# TaskMaster AI Coding Instructions

## Architecture Overview

TaskMaster is a React-based task management app with AWS serverless backend. Key architectural decisions:

-   **Context-driven state management**: Global state via `AppContext.js` using React Context API, not Redux
-   **View-Component separation**: Views in `/views/` handle routing/layout, Components in `/components/` are reusable UI pieces
-   **Service layer pattern**: All API calls isolated in `/services/` (api.js, groupService.js)
-   **Custom User model**: `models/User.js` handles local state management with localStorage persistence
-   **Hook-based initialization**: Custom hooks like `useInitializeUser` handle complex setup workflows

## Critical Data Flow Patterns

### Task/Group Operations

```javascript
// Always use context for state updates
const { setTasks, setGroups, selectedGroup } = useApp();

// API calls return full datasets, not incremental updates
const groups = await addGroup(groupName); // Returns ALL groups
setGroups(groups); // Replace entire state
```

### Authentication & User State

-   Auth0 for authentication, custom User model for app state
-   User initialization: Auth0 user → API Gateway → User model → localStorage
-   Session monitoring via `useSessionMonitor` hook in `authHelper.js`
-   User ID pattern: `auth0User.sub` as primary identifier

## Development Workflows

### Local Development

```bash
npm start           # Standard React dev server
npm run build       # Production build for Netlify
npm test            # Jest test runner
```

### API Integration

-   Base URLs hardcoded in service files (AWS Lambda endpoints)
-   All API calls use axios with error handling in catch blocks
-   Backend returns `{ Items: [...] }` format for lists

## Component Conventions

### File Naming & Structure

-   Components: PascalCase.jsx (e.g., `TaskForm.jsx`)
-   Services: camelCase.js (e.g., `groupService.js`)
-   Hooks: usePrefix.jsx (e.g., `useLoadGroups.jsx`)
-   Profile components organized in subfolder: `components/profile/`

### Props & State Patterns

```javascript
// Standard component signature with destructured context
const TaskForm = ({ onClose, onTaskAdded }) => {
    const { selectedGroup, setRefreshFlag } = useApp();

    // Modal close pattern - always call parent callback
    const handleClose = () => {
        onClose();
    };
};
```

### Modal/Dialog Pattern

-   All dialogs use conditional rendering: `{showDialog && <Dialog />}`
-   Close handlers passed as props, not handled internally
-   Form validation occurs in individual components, not globally

## Styling Conventions

### TailwindCSS Usage

-   Dark mode via `dark:` prefix with class-based toggling
-   Responsive breakpoints: `sm:` (640px+), `md:` (768px+), etc.
-   Custom scrollbar styling via `tailwind-scrollbar` plugin
-   Color scheme: gray backgrounds, green accents for actions

### Component Styling Patterns

```javascript
// Standard container classes
<div className="sm:p-10 mx-auto bg-gray-100 dark:bg-gray-900 w-full sm:w-11/12...">

// Button styling pattern
<button className="px-4 py-2 bg-green-500 text-white rounded-md">
```

## Key Integration Points

### AWS Lambda Endpoints

-   Tasks API: `https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev/tasks`
-   Groups API: `https://jvv0skyaw1.execute-api.us-east-2.amazonaws.com/dev/groups`
-   User metadata: `https://amxpsay0hd.execute-api.us-east-2.amazonaws.com/Dev/users/{sub}/metadata`

### Auth0 Configuration

-   Environment variables: `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENTID`, `REACT_APP_AUTH0_AUDIENCE`
-   Config helper in `services/config.js` handles audience validation
-   Router-based auth flow: `/landing` → `/setup` → `/` (MainView)

## Important Patterns to Follow

### State Management

-   Use `refreshFlag` pattern for triggering re-renders: `setRefreshFlag(prev => !prev)`
-   Always update context state, then let components react to changes
-   User state persisted to localStorage via User model methods

### Error Handling

-   Console.error for API failures, but no centralized error handling yet
-   TODO comments indicate planned improvements for user feedback

### Component Communication

-   Parent-child: Props for data down, callbacks for events up
-   Sibling components: Context for shared state
-   Highlighting pattern: Pass `highlightedTaskID/GroupID` through props

## Current Limitations & TODOs

-   Multi-user support planned but not implemented (userId params in TODOs)
-   Form validation is basic, planned enhancements in README
-   Profile picture upload uses AWS S3 (ProfilePicUploader component)
-   Offline mode exists (`MainViewOffline.jsx`) but limited functionality

## Testing Notes

-   Jest setup via Create React App
-   Test files follow `.test.js` naming convention
-   Component testing focuses on user interactions, not implementation details
