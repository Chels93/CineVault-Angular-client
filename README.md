# Angular App (CineVault-Angular-client)

## OVERVIEW:
CineVaultAngularClient is a single-page, responsive movie application built using Angular. It interfaces with the existing server-side code (REST API and database) to provide movie enthusiasts with detailed information on movies, directors, and genres, while allowing them to create personalized profiles to save their favorite movies.

## KEY FEATURES:
- **Welcome View:** users can register or log in using dedicated forms
- **Movie Listings:** authenticated users can view a catalog of movies
- **Single Movie View:** users can click on a movie to see detailed information by navigating to a director view and a genre view
- **Profile Managment:** users can create and update their profiles, saving their favorite movies 

## TECHNICAL STACK:
- Angular (version 9 or later)
- Angular Material: responsive design for a seamless user experience on all devices
- User authentication and registration forms
- Dynamic routing: for smooth navigation between views
- Hosted on GitHub pages

## INSTALLATION PREREQUISITES:
- Node.js (latest version)
- Angluar CLI: npm install -g @angular/cli

## PROJECT STRUCTURE:
- This project follows a modular structre to ensure scalability and maintainability 
- src/app: contains the main application logic and components
    - components/: reusable UI components
    - services/: handles API communication 
    - models/: defines the data structures used across the app
    - views/: contains main views for app (e.g. Welcome, Profile)

## DOCUMENTATION:
- **Comments:** this codebase is extensively commented using Typedoc for Angular components
- **User Stories:** 
    - As a user, I want to receive information about movies, directors, and genres so I can learn more about movies. 
    - As a user, I want to create a profile to save data about my favorite movies. 
- **Kanban Board:** a comprehensive board has been maintained throughout Development
    - Link: https://view.monday.com/7378479773-a32207da3ab838d117b0e2021a11c6ed?r=use1

## DEPLOYMENT:
- **Development Server:**
    - Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
- **Code Scaffolding:**
    - Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
- **Build:**
    - Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## TESTING:
- **Running Unit Tests:**
    - Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io)
- **Running End-to-End Tests:**
    - Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
