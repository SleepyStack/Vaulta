# Vaulta

A secure banking platform built with Spring Boot and Next.js, implementing industry-standard authentication, authorization, and transaction management.

> **🚀 Live Demo**: _Coming Soon_ (Deployment in progress)

## Architecture

**Backend**:  Spring Boot 4.0.1 (Java 21)  
**Frontend**: Next.js 16.1.1 with React 19  
**Database**: PostgreSQL  
**Authentication**: JWT with token versioning  
**Migrations**: Flyway

## Tech Stack

### Backend
- Spring Boot (Web, Data JPA, Security, Validation)
- PostgreSQL
- Flyway (Database Migration Management)
- Spring Security with JWT
- Spring Boot Actuator
- Lombok
- Maven
- Testcontainers (Testing)
- OpenAPI/Swagger Documentation

### Frontend
- Next.js 16 with App Router
- React 19 with React Compiler
- TypeScript
- Tailwind CSS 4
- Axios
- Lucide React Icons

## Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL
- Maven (or use included wrapper)

## Installation

### Backend Setup

1. Clone the repository: 
```bash
git clone https://github.com/SleepyStack/Vaulta.git
cd Vaulta
```

2. Configure database connection in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/vaulta
spring.datasource. username=your_username
spring.datasource. password=your_password

# Flyway Configuration (Optional - uses defaults if not specified)
spring.flyway.enabled=true
spring.flyway. baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

**Note**: It is recommended to use a `.env` file with the `dotenv-java` dependency (already included in `pom.xml`) to manage environment variables rather than hard-coding credentials. 

3. Build and run: 
```bash
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

**Database Migrations**: Flyway will automatically run migrations on startup, creating the necessary schema from files in `src/main/resources/db/migration/`.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env. local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Run development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Features

- **User Authentication**: JWT-based authentication with token versioning
- **Authorization**: Role-based access control (USER, ADMIN)
- **Account Management**: User registration, login, profile management
- **Transaction Processing**: Deposits, withdrawals, and transfers
- **Database Migrations**: Automated schema versioning with Flyway
- **API Documentation**: Interactive API docs via OpenAPI/Swagger
- **Health Monitoring**: Spring Boot Actuator endpoints
- **Security**: 
  - Token versioning for forced logout
  - Rate limiting with Bucket4j
  - Secure password hashing with BCrypt
  - Request queue management
  - CORS configuration
- **Modern UI**: Responsive design with Tailwind CSS

## Database Migration Management

This project uses **Flyway** for database schema versioning and migrations. 

### Migration Files

Migration scripts are located in `src/main/resources/db/migration/`:
- `V1__init_schema.sql` - Initial database schema with tables for users, accounts, and transactions

### Key Migration Features
- **Automatic Execution**: Migrations run automatically on application startup
- **Version Control**: Database schema changes are tracked and versioned
- **Rollback Safety**: Flyway ensures migrations are applied in order and prevents conflicts
- **Custom Types**: PostgreSQL ENUM types for account types, statuses, roles, and transaction types

### Adding New Migrations

To add a new migration: 
1. Create a new SQL file in `src/main/resources/db/migration/`
2. Follow the naming convention: `V{version}__{description}.sql` (e.g., `V2__add_user_preferences.sql`)
3. Flyway will automatically detect and apply the migration on next startup

## API Structure

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

### Transaction Endpoints
- `POST /api/transactions/deposit` - Deposit funds
- `POST /api/transactions/withdraw` - Withdraw funds
- `POST /api/transactions/transfer` - Transfer funds
- `GET /api/transactions/history` - Transaction history

### API Documentation
Access interactive API documentation at `http://localhost:8080/swagger-ui. html` when running locally.

## Project Structure

```
Vaulta/
├── src/
│   ├── main/
│   │   ├── java/com/github/sleepystack/vaulta/
│   │   │   ├── config/          # Security & app configuration
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── repository/      # Data repositories
│   │   │   ├── service/         # Business logic
│   │   │   ├── security/        # Security components
│   │   │   ├── dto/             # Data transfer objects
│   │   │   └── util/            # Utility classes
│   │   └── resources/
│   │       ├── db/
│   │       │   └── migration/   # Flyway migration scripts
│   │       └── application.properties
│   └── test/                    # Unit & integration tests
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client & utilities
│   │   └── types/               # TypeScript types
│   └── public/                  # Static assets
└── pom.xml
```

## Testing

### Backend Tests
```bash
./mvnw test
```

The test suite includes integration tests with Testcontainers for PostgreSQL. 

### Frontend Tests
```bash
cd frontend
npm run lint
```

## Building for Production

### Backend
```bash
./mvnw clean package
java -jar target/Vaulta-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Deployment

**Docker deployment coming soon! ** The application will be containerized and deployed to a cloud platform with the following components: 
- Dockerized Spring Boot backend
- Dockerized Next.js frontend
- PostgreSQL database
- Automated Flyway migrations on deployment

## Security Considerations

- JWT tokens stored in localStorage (client-side)
- Token versioning prevents unauthorized access after logout
- CORS configured for cross-origin requests
- Rate limiting on sensitive endpoints with Bucket4j
- Password encryption with BCrypt
- Request queue management to prevent API abuse
- Database migrations managed securely through Flyway
- Soft delete implementation for data retention

## Environment Variables

### Backend
Configure the following in `application.properties` or via environment variables: 

| Variable | Description | Default |
|----------|-------------|---------|
| `spring.datasource.url` | PostgreSQL connection URL | - |
| `spring.datasource.username` | Database username | - |
| `spring.datasource.password` | Database password | - |
| `spring.flyway.enabled` | Enable Flyway migrations | `true` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

## Default Credentials

A super admin account is automatically created on first run: 
- **Email**: `admin@vaulta.com`
- **Password**: `Admin123!`

**⚠️ Change these credentials immediately in production environments!**

## Credits

Built with resources from:
- **Spring Boot** - Framework foundation
- **Laur Spilca** - [YouTube Channel](https://www.youtube.com/@laurspilca) - Security architecture guidance

## License

This project is available for educational and commercial use.  

## Author

**SleepyStack**  
[GitHub Profile](https://github.com/SleepyStack)

---

**Version**: 0.0.1-SNAPSHOT  
**Last Updated**:  2026-01-07
