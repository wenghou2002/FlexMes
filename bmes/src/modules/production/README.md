# Production Module

This module implements the MVC (Model-View-Controller) pattern for managing productions in the MES (Manufacturing Execution System) Dashboard application.

## Structure

The Production module is structured as follows:

- `models.ts` - Contains the type definitions and interfaces that represent the data model
- `services.ts` - Contains the business logic, database operations, and data transformation
- `controllers.ts` - Handles HTTP requests and responses, orchestrates services
- `routes.ts` - Defines API routes and connects them to controller methods
- `validations.ts` - Contains validation rules for API inputs

## MVC Implementation

### Model (models.ts)

The Model represents the data structure and properties of the Production entity. It includes:

- Base interfaces for the Production record
- Input interfaces for creating and updating productions
- Extended interfaces for productions with related data (e.g., inspections, user info)

### View

The View is implemented in the frontend application. In this backend module, the "View" equivalent is the formatted JSON responses sent to the client.

### Controller (controllers.ts)

The Controller:
- Receives HTTP requests
- Validates request data
- Orchestrates the necessary service calls
- Formats and sends appropriate HTTP responses
- Handles error conditions

### Service Layer (services.ts)

While not a traditional part of MVC, the Service layer is an extension that:
- Encapsulates business logic
- Performs database operations
- Handles data transformation
- Manages complex operations like user-specific display IDs
- Implements access control checks

## API Routes

All production-related API endpoints are defined in `routes.ts` and include:

- `GET /api/productions` - Get all productions
- `GET /api/productions/:id` - Get a specific production
- `POST /api/productions` - Create a new production
- `PUT /api/productions/:id` - Update a production
- `DELETE /api/productions/:id` - Delete a production
- `GET /api/productions/export/csv` - Export productions data as CSV

## Validation

Input validation is implemented in `validations.ts` using express-validator, ensuring that all data entering the system meets the required format and constraints.

## Security

The module implements several security measures:
- User-specific data access (users can only see their own productions)
- Authentication checks via auth middleware
- Data validation to prevent malformed input
- Role-based authorization for certain operations
