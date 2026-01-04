package com.github.sleepystack.vaulta.exception;

import org.springframework.http.HttpStatus;

public class AccountNotFoundException extends BankException {
    public AccountNotFoundException(String identifier) {
        super("Account not found with: " + identifier, HttpStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND");
    }
}
