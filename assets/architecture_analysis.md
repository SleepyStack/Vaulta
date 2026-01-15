# Vaulta Architecture & Flow Analysis

This document provides a detailed analysis of the Vaulta banking platform's architecture, including request flows and database schema.

## 1. System Architecture

Vaulta follows a modern 3-tier architecture with a decoupled frontend and backend.

- **Frontend**: Next.js 16 (React 19) application interacting with the API via REST.
- **Backend**: Spring Boot 3+ (Java 21) REST Application.
- **Database**: PostgreSQL for persistent storage.

```mermaid
graph TD
    subgraph Client Layer
        Browser[Web Browser / Client]
    end

    subgraph Application Layer
        LB[Load Balancer / Ingress]
        NextJS[Next.js Frontend]
        SpringBoot[Spring Boot Backend]
    end

    subgraph Data Layer
        Postgres[(PostgreSQL Database)]
    end

    Browser -->|HTTPS| NextJS
    Browser -->|API Calls / HTTPS| SpringBoot
    NextJS -->|SSR Data Fetching| SpringBoot
    SpringBoot -->|JDBC / JPA| Postgres
```

## 2. Authentication & Authorization Flow

Authentication is handled via JWT (JSON Web Tokens). The system uses **Token Versioning** to allow for immediate token invalidation (e.g., on logout or security events).

### Login Flow
```mermaid
sequenceDiagram
    participant User
    participant AuthController
    participant AuthService
    participant JwtService
    participant DB as Database

    User->>AuthController: POST /api/v1/auth/login (email, password)
    AuthController->>AuthService: authenticate(request)
    AuthService->>DB: Find User by Email
    DB-->>AuthService: User Details (inc. Password Hash)
    AuthService->>AuthService: Validate Password
    AuthService->>JwtService: generateToken(user)
    JwtService-->>AuthService: JWT String
    AuthService-->>AuthController: AuthResponseDTO (JWT)
    AuthController-->>User: 200 OK + Bearer Token
```

### Protected Request Flow (Authorization)
```mermaid
sequenceDiagram
    participant Client
    participant RateLimit as RateLimitingFilter
    participant AuthFilter
    participant JwtService
    participant Controller

    Client->>RateLimit: Request with Bearer Token
    RateLimit->>RateLimit: Check IP Bucket
    alt Bucket Empty
        RateLimit-->>Client: 429 Too Many Requests
    else Bucket Has Tokens
        RateLimit->>AuthFilter: Forward Request
        AuthFilter->>JwtService: extractUsername(token)
        AuthFilter->>JwtService: extractTokenVersion(token)
        AuthFilter->>AuthFilter: Load UserDetails from DB
        AuthFilter->>AuthFilter: Check token_version == db_version
        
        alt Token Valid & Version Matches
            AuthFilter->>Controller: Set SecurityContext & Proceed
            Controller-->>Client: 200 OK Response
        else Token Invalid or Old Version
            AuthFilter-->>Client: 403 Forbidden
        end
    end
```

## 3. Transaction Processing Flow

Transactions (Deposit, Withdrawal, Transfer) are transactional (ACID) operations ensuring data integrity. A Transfer operation is composed of a Withdrawal followed by a Deposit.

### Transfer Flow
```mermaid
sequenceDiagram
    participant User
    participant TxController as TransactionController
    participant TxService as TransactionService
    participant AccRepo as AccountRepository
    participant TxRepo as TransactionRepository
    participant DB as Database

    User->>TxController: POST /transfer (amount, targetAcc)
    TxController->>TxService: transfer(from, to, amount)
    
    note right of TxService: @Transactional Start
    
    %% Step 1: Withdraw
    TxService->>TxService: withdraw(from, amount)
    TxService->>AccRepo: findByAccountNumber(from)
    AccRepo-->>TxService: Account Entity
    TxService->>TxService: Check Balance > Amount
    TxService->>TxService: Account.balance -= amount
    TxService->>TxRepo: save(Transaction: WITHDRAWAL)
    
    %% Step 2: Deposit
    TxService->>TxService: deposit(to, amount)
    TxService->>AccRepo: findByAccountNumber(to)
    AccRepo-->>TxService: Account Entity
    TxService->>TxService: Account.balance += amount
    TxService->>TxRepo: save(Transaction: DEPOSIT)

    %% Step 3: Record Transfer
    TxService->>TxRepo: save(Transaction: TRANSFER)
    
    note right of TxService: @Transactional Commit
    
    TxService-->>TxController: Success
    TxController-->>User: 200 OK
```

## 4. Rate Limiting Flow

Rate limiting is implemented using **Bucket4j** via a custom `RateLimitingFilter`. It uses a Token Bucket algorithm keying off the client's IP address.

- **Limit**: 10 requests per minute.
- **Refill Strategy**: Greedy refill (smoothly adds tokens over time).
- **Scope**: Applied to all `/api/` endpoints except `/api/v1/admin/`.

```mermaid
flowchart TD
    A[Incoming Request] --> B{Is Admin Path?}
    B -- Yes --> C[Allow Request]
    B -- No --> D[Get Client IP]
    D --> E{Get/Create Bucket for IP}
    E --> F{Try Consume 1 Token}
    F -- Success --> C[Allow Request]
    F -- Fail --> G[Return 429 Too Many Requests]
    G --> H[Stop Processing]
```

## 5. Database Schema

The database uses PostgreSQL with ENUM types for strict data validation. `Flyway` handles schema versioning.

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : owns
    USERS {
        bigserial id PK
        varchar username
        varchar email
        varchar password
        enum role "USER, ADMIN"
        enum status "ACTIVE, INACTIVE..."
        int token_version
        boolean deleted
    }

    ACCOUNTS ||--o{ TRANSACTIONS : "referenced by (loosely)"
    ACCOUNTS {
        bigserial id PK
        varchar account_number "Unique"
        decimal balance
        bigint user_id FK
        enum account_type
        enum status
        boolean deleted
    }

    TRANSACTIONS {
        bigserial id PK
        enum type "DEPOSIT, WITHDRAWAL, TRANSFER"
        decimal amount
        varchar from_account_number
        varchar to_account_number
        timestamp timestamp
    }
```

### Key Schema Notes:
- **Token Versioning**: `users.token_version` is used to invalidate JWTs server-side without a blacklist.
- **Soft Deletes**: `deleted` flag on `users` and `accounts` allows for data retention.
- **Decoupled Transactions**: The `transactions` table stores account numbers as strings (`varchar`) rather than foreign keys to `accounts.id`. This preserves transaction history even if an account is hard-deleted or archived.
