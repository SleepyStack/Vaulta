package com.github.sleepystack.vaulta.dto;

import lombok.Builder;

@Builder
public record AuthResponseDTO(
        String token
) {}
