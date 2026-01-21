# PGE Digital Backend

Sistema de Gestão de Processos Eletrônicos - Backend API

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
PGE_DIGITAL_HOST=your_database_host
PGE_DIGITAL_USER=your_database_user
PGE_DIGITAL_PASSWORD=your_database_password
PGE_DIGITAL_DATABASE=pgedigital

# Server Configuration (optional, defaults to 3000)
PORT=3000
```

See `.env.example` for a template.

## Installation

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Runs the application using `tsx` for hot reload.

### Production Mode

```bash
npm run build
npm start
```

Compiles TypeScript to JavaScript and runs the compiled code.

## API Endpoints

- **API Server**: http://localhost:3000
- **OpenAPI Spec**: http://localhost:3000/openapi.json
- **API Documentation**: http://localhost:3000/docs

## Project Structure

```
src/
├── config/          # Configuration files (database, etc.)
├── controllers/     # API controllers
├── dtos/           # Data Transfer Objects
├── entities/        # Database entities
├── modules/         # Feature modules
├── repositories/    # Data access layer
└── services/        # Business logic
```

## Database

This project uses SQL Server with the `tedious` driver via `metal-orm`.

## Built With

- **adorn-api** - Decorator-first web framework with OpenAPI 3.1 support
- **metal-orm** - ORM for database operations
- **express** - HTTP server
- **typescript** - TypeScript compiler
