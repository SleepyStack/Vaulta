package com.github.sleepystack.vaulta.exception;

import org.springframework.http.HttpStatus;

public class ExistingCredentialsException extends BankException {
    public ExistingCredentialsException(String message) {
        super(message, HttpStatus.CONFLICT, "CREDENTIALS_ALREADY_EXISTS");
    }
}
