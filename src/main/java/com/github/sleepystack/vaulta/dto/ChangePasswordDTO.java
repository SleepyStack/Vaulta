package com.github.sleepystack.vaulta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDTO(
        @NotBlank(message = "Old password is required")
        String oldPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "New password must be at least 8 characters long")
        String newPassword
) {}
