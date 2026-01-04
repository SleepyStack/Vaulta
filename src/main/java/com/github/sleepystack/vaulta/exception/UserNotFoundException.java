package com.github.sleepystack.vaulta.exception;

import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BankException {
    public UserNotFoundException(String identifier) {
        super("User not found with: " + identifier, HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
    }
}
