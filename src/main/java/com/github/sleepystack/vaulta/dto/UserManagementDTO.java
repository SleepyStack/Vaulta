package com.github.sleepystack.vaulta.dto;

import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;

import java.math.BigDecimal;

public record UserManagementDTO(
        Long id,
        String username,
        String email,
        Role role,
        Status status,
        int tokenVersion,
        BigDecimal totalBalance
) {}