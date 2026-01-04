package com.github.sleepystack.vaulta.exception;

import org.springframework.http.HttpStatus;

public class BusinessLogicException extends BankException {

    public BusinessLogicException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BUSINESS_RULE_VIOLATION");
    }
}
