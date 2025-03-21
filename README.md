# FlexMES

A Manufacturing Execution System (MES) for managing production and quality control.

## Project Structure

This project consists of two main parts:

- `bmes/` - Backend API (Node.js/Express with TypeScript)
- `fmes/` - Frontend Application (Vue.js with TypeScript)

## Prerequisites

- Node.js (v16+)
- PostgreSQL database
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd bmes
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `bmes` directory with the following content:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/flexmes?schema=public"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-strong-secret-key
   JWT_ACCESS_EXPIRY=1h
   JWT_REFRESH_EXPIRY=7d
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Generate Prisma client:
   ```
   npx prisma generate
   ```

6. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd fmes
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `fmes` directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Features

- User authentication with JWT
- Role-based access control
- Production tracking
- Quality control management
- Dashboard analytics

## User-Specific Data Access Implementation

The system now implements user-specific data access for both Quality Control and Production data. Each user can only see and manage their own records.

### Database Schema

The Prisma schema has been updated to include user relationships:

```prisma
model User {
  id          Int              @id @default(autoincrement())
  username    String           @unique @db.VarChar(50)
  email       String           @unique @db.VarChar(100)
  password    String           @db.VarChar(255)
  role        String           @default("user") @db.VarChar(20)
  createdAt   DateTime         @default(now()) @map("created_at") @db.Timestamp()
  updatedAt   DateTime         @updatedAt @map("updated_at") @db.Timestamp()
  inspections QualityControl[]
  productions Production[]

  @@map("users")
}

model Production {
  id           Int              @id @default(autoincrement()) @map("product_id")
  displayId    Int              @default(1) @map("display_id")
  name         String           @db.VarChar(100)
  status       String           @db.VarChar(50)
  material     String?          @db.VarChar(255)
  userId       Int?             @map("user_id")
  createdAt    DateTime         @default(now()) @map("created_at") @db.Timestamp()
  inspections  QualityControl[]
  user         User?            @relation(fields: [userId], references: [id])

  @@map("production")
}

model QualityControl {
  id             Int        @id @default(autoincrement()) @map("inspection_id")
  displayId      Int        @default(1) @map("display_id")
  productId      Int        @map("product_id")
  inspectionDate DateTime   @map("inspection_date") @db.Date
  scheduledDate  DateTime   @map("scheduled_date") @db.Date
  result         String     @db.VarChar(50)
  userId         Int?       @map("user_id")
  createdAt      DateTime   @default(now()) @map("created_at") @db.Timestamp()
  product        Production @relation(fields: [productId], references: [id])
  user           User?      @relation(fields: [userId], references: [id])

  @@map("quality_control")
}
```

### Backend Implementation

The backend controllers now filter data by userId:

1. **QualityControl Controller**:
   - `getAllQualityControls` - Filters by userId in query parameters
   - `createQualityControl` - Stores the userId with each record
   - `updateQualityControl` - Validates ownership before updates
   - `exportQualityControlCSV` - Only exports user-specific records

2. **Production Controller**:
   - `getAllProductions` - Filters by userId in query parameters
   - `createProduction` - Stores the userId with each record
   - `updateProduction` - Validates ownership before updates
   - `deleteProduction` - Verifies ownership before deletion
   - `exportProductionCSV` - Only exports user-specific records

### Frontend Implementation

The frontend services have been updated to include the user ID in all API requests:

1. **qcService.ts**:
   - Gets the current user from localStorage
   - Adds userId to all requests
   - Filters API responses by userId

2. **productionService.ts**:
   - Gets the current user from localStorage
   - Adds userId to all create and update requests
   - Includes userId for delete operations
   - Filters API responses by userId

### Usage

When a user logs in, their user ID is stored in localStorage. All API requests will include this user ID, and the backend will filter data to show only records belonging to the current user.


## Code Architecture and Best Practices

The application follows a modern, maintainable architecture with clear separation of concerns and adherence to best practices:

### Backend Architecture (bmes)

The backend follows a modular MVC-like architecture:

1. **Models**: Prisma schema defines database models with clear relationships
2. **Controllers**: Handle request/response logic and business rules
3. **Routes**: Define API endpoints and connect them to controllers
4. **Middleware**: Manages authentication, authorization, and data access control
5. **Config**: Centralizes configuration settings
6. **Utils**: Contains reusable utility functions

#### Key architectural features:

- **Modular Structure**: Each feature (auth, production, qualityControl) is isolated in its own module
- **Middleware-based Security**: JWT authentication and role-based authorization
- **Data Access Control**: User-specific data filtering via middleware
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Consistent error responses with appropriate status codes

### Frontend Architecture (fmes)

The frontend follows Vue.js best practices with a clean component structure:

1. **Views**: Page components representing different routes
2. **Components**: Reusable UI elements organized by feature
3. **Services**: Handle API communication and data transformation
4. **Stores**: Manage application state using Pinia
5. **Router**: Manages navigation and route protection
6. **Assets**: Static resources like images and styles

#### Key architectural features:

- **Component-based Design**: Modular, reusable components
- **State Management**: Centralized state using Pinia stores
- **API Layer**: Services abstract API communication details
- **Responsive UI**: Mobile-friendly design using Tailwind CSS
- **Authentication Flow**: Token-based auth with refresh handling

### Security Practices

- JWT authentication with token refresh
- Role-based access control (RBAC)
- User-specific data access (data isolation)
- Input validation on both client and server
- Secure password handling
- Middleware-based security enforcement

### Authentication Details

The registration API provides detailed password requirements feedback to users:

```json
{
  "passwordRequirements": {
    "minLength": 8,
    "requiresDigit": true,
    "requiresUppercase": true,
    "requiresLowercase": true,
    "requiresSpecialChar": true,
    "exampleValidPassword": "Example1Password!"
  }
}
```

The frontend displays these requirements to users during registration with helpful visual indicators.

### Performance Considerations

- Efficient database queries with proper indexing
- Pagination for large data sets
- Optimized frontend assets
- Lazy loading of components

### Maintainability Features

- Consistent code style and naming conventions
- Clear separation of concerns
- DRY (Don't Repeat Yourself) principles
- Comprehensive error handling
- Meaningful variable and function names
- Type safety with TypeScript

### UX Considerations

- Clean, modern UI with Tailwind CSS
- Responsive design for all devices
- Consistent error messaging
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Toasts for operation feedback
