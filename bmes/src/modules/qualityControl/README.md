# Quality Control Module

This module implements the MVC (Model-View-Controller) pattern for managing quality control inspections in the MES (Manufacturing Execution System) Dashboard application.

## Structure

The Quality Control module is structured as follows:

- `models.ts` - Contains the type definitions and interfaces that represent the data model
- `services.ts` - Contains the business logic, database operations, and data transformation
- `controllers.ts` - Handles HTTP requests and responses, orchestrates services
- `routes.ts` - Defines API routes and connects them to controller methods
- `validations.ts` - Contains validation rules for API inputs

## MVC Implementation

### Model (models.ts)

The Model represents the data structure and properties of the QualityControl entity. It includes:

- Type definitions for severity levels
- Base interfaces for the QualityControl record
- Input interfaces for creating and updating quality control records
- Extended interfaces for quality controls with related data (e.g., product, user info)

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
- Manages complex operations like user-specific display IDs and severity defaults
- Implements access control checks

## API Routes

All quality control-related API endpoints are defined in `routes.ts` and include:

- `GET /api/quality-controls` - Get all quality control records
- `GET /api/quality-controls/:id` - Get a specific quality control record
- `POST /api/quality-controls` - Create a new quality control inspection
- `PUT /api/quality-controls/:id` - Update a quality control record
- `DELETE /api/quality-controls/:id` - Delete a quality control record
- `GET /api/quality-controls/export/csv` - Export quality control data as CSV

## Validation

Input validation is implemented in `validations.ts` using express-validator, ensuring that all data entering the system meets the required format and constraints.

## Security

The module implements several security measures:
- User-specific data access (users can only see their own quality control records)
- Authentication checks via auth middleware
- Data validation to prevent malformed input
- Role-based authorization for certain operations
- Special handling for severity levels in failed inspections 
