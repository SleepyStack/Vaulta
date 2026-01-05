package com.github.sleepystack.vaulta.controller;

import com.github.sleepystack.vaulta.dto.AccountRequestDTO;
import com.github.sleepystack.vaulta.dto.AccountResponseDTO;
import com.github.sleepystack.vaulta.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.ResponseEntity.noContent;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/open")
    public ResponseEntity<AccountResponseDTO> openAccount(@Valid @RequestBody AccountRequestDTO a, Authentication authentication) {
        return new ResponseEntity<>(accountService.openAccount(a,authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<AccountResponseDTO>> getMyAccounts(Authentication authentication) {
        String email = authentication.getName();
        List<AccountResponseDTO> accounts = accountService.getAccountsByUserEmail(email);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponseDTO> getAccount(
            @PathVariable String accountNumber,
            Authentication auth) {
        return ResponseEntity.ok(accountService.getAccountDetails(accountNumber, auth.getName()));
    }

    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<Void> closeAccount(@PathVariable String accountNumber, Authentication authentication) {
        accountService.closeAccount(accountNumber,authentication.getName() );
        return noContent().build();
    }

}