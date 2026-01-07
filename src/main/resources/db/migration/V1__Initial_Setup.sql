CREATE TYPE account_type AS ENUM ('SAVINGS', 'CHECKING', 'CREDIT');
CREATE TYPE status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
CREATE TYPE transaction_type AS ENUM ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL');

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role user_role NOT NULL,
                       status status NOT NULL DEFAULT 'ACTIVE',
                       token_version INT DEFAULT 0,
                       created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE accounts (
                          id BIGSERIAL PRIMARY KEY,
                          account_number VARCHAR(20) UNIQUE NOT NULL,
                          balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
                          user_id BIGINT NOT NULL,
                          account_type account_type NOT NULL,
                          status status NOT NULL DEFAULT 'ACTIVE',
                          deleted BOOLEAN DEFAULT FALSE,
                          CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
                              id BIGSERIAL PRIMARY KEY,
                              type transaction_type NOT NULL,
                              amount DECIMAL(15, 2) NOT NULL,
                              from_account_number VARCHAR(20),
                              to_account_number VARCHAR(20),
                              timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);