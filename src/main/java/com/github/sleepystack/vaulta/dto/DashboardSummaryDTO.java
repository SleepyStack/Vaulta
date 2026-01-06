package com.github.sleepystack.vaulta.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryDTO(
        BigDecimal totalBalance,
        String primaryAccountNumber,
        List<TransactionDTO> recentTransactions,
        String userStatus
) {}
