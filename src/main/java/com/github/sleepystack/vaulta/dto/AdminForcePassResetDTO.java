package com.github.sleepystack.vaulta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminForcePassResetDTO(
        @NotBlank(message = "Temporary password is required")
        @Size(min = 8, message = "Temporary password must be at least 8 characters long")
        String tempPassword
) {}
