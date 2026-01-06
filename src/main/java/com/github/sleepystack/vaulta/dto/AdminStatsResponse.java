package com.github.sleepystack.vaulta.dto;

import java.math.BigDecimal;

public record AdminStatsResponse(
        long totalUsers,
        long activeUsers,
        long lockedUsers,
        BigDecimal totalSystemBalance,
        long totalTransactionsCount
) {}