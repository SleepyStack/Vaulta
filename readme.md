# Vaulta

A secure banking platform built with Spring Boot and Next.js, implementing industry-standard authentication, authorization, and transaction management.

## Architecture

**Backend**:  Spring Boot 4.0.1 (Java 21)  
**Frontend**: Next.js 16.1.1 with React 19  
**Database**: PostgreSQL  
**Authentication**: JWT with token versioning

## Tech Stack

### Backend
- Spring Boot (Web, Data JPA, Security, Validation)
- PostgreSQL
- Spring Security with JWT
- Lombok
- Maven
- Testcontainers (Testing)

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
spring.datasource.password=your_password
```
I Suggest Using .env file with a plugin or dependency to use environment variables, rather then hard-coding, one such dependency is already in the pom.xml if required.

3. Build and run:
```bash
./mvnw clean install
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
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
- **Authorization**:  Role-based access control (USER, ADMIN)
- **Account Management**: User registration, login, profile management
- **Transaction Processing**:  Deposits, withdrawals, and transfers
- **Security**: 
  - Token versioning for forced logout
  - Rate limiting
  - Secure password hashing
  - Request queue management
- **Modern UI**: Responsive design with Tailwind CSS

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
│   │   │   └── dto/             # Data transfer objects
│   │   └── resources/
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

### Frontend Tests
```bash
cd frontend
npm run lint
```

## Building for Production

### Backend
```bash
./mvnw clean package
java -jar target/Vaulta-0.0.1-SNAPSHOT. jar
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Security Considerations

- JWT tokens stored in localStorage (client-side)
- Token versioning prevents unauthorized access after logout
- CORS configured for cross-origin requests
- Rate limiting on sensitive endpoints
- Password encryption with BCrypt
- Request queue to prevent API abuse

## Environment Variables

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

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
**Last Updated**:  2026-01-06
