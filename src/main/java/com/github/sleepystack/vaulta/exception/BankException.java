package com.github.sleepystack.vaulta.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BankException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    protected BankException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}
