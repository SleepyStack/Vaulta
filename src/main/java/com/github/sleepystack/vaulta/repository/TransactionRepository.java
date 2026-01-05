package com.github.sleepystack.vaulta.repository;

import com.github.sleepystack.vaulta.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccountNumberOrToAccountNumberOrderByTimestampDesc(
            String fromAccountNumber,
            String toAccountNumber
    );

    @Query("SELECT t FROM Transaction t WHERE t.fromAccountNumber = :acc OR t.toAccountNumber = :acc ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountNumber(@Param("acc") String acc);
}
