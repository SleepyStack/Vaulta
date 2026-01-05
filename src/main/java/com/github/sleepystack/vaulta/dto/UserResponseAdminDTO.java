package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;

public record UserResponseAdminDTO(
        Long id,
        String username,
        String email,
        Status status,
        Role role
) {}
