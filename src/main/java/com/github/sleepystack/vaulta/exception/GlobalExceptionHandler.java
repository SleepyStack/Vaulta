package com.github.sleepystack.vaulta.exception;

import com.github.sleepystack.vaulta.dto.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.databind.exc.InvalidFormatException;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle our custom "Self-Describing" Bank Exceptions
    @ExceptionHandler(BankException.class)
    public ResponseEntity<ErrorResponseDTO> handleBankException(BankException ex, HttpServletRequest request) {
        log.warn("Business Exception [{}]: {}", ex.getErrorCode(), ex.getMessage());
        return buildResponseEntity(ex.getStatus(), ex.getErrorCode(), ex.getMessage(), request.getRequestURI());
    }

    // 2. Handle Enum conversion failures (The Jackson stuff you asked for)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDTO> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        String message = "Malformed JSON request or invalid data format.";
        String errorCode = "INVALID_PAYLOAD_FORMAT";
        if (ex.getCause() instanceof InvalidFormatException ife) {
            if (ife.getTargetType().isEnum()) {
                errorCode = "INVALID_ENUM_VALUE";
                message = String.format("Invalid value '%s' for %s. Accepted values: %s",
                        ife.getValue(),
                        ife.getTargetType().getSimpleName(),
                        java.util.Arrays.toString(ife.getTargetType().getEnumConstants()));
            }
        }

        log.error("Payload Error: {}", message);
        return buildResponseEntity(HttpStatus.BAD_REQUEST, errorCode, message, request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return buildResponseEntity(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", errorMessage, request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("CRITICAL ERROR: ", ex);
        return buildResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred. Please contact support.", request.getRequestURI());
    }

    private ResponseEntity<ErrorResponseDTO> buildResponseEntity(HttpStatus status, String error, String message, String path) {
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                LocalDateTime.now(),
                status.value(),
                error,
                message,
                path
        );
        return new ResponseEntity<>(errorResponse, status);
    }
}