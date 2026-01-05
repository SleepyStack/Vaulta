package com.github.sleepystack.vaulta.dto;

public record UserResponseDTO(
        Long id,
        String username,
        String email
) {}