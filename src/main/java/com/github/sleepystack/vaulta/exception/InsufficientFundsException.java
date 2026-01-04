package com.github.sleepystack.vaulta.exception;

import org.springframework.http.HttpStatus;

public class InsufficientFundsException extends BankException {
    public InsufficientFundsException(String accountNumber) {
        super("Insufficient funds in account: " + accountNumber, HttpStatus.BAD_REQUEST, "INSUFFICIENT_FUNDS");
    }
}
