package com.github.sleepystack.vaulta.service;

import com.github.sleepystack.vaulta.entity.Account;
import com.github.sleepystack.vaulta.entity.User;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import com.github.sleepystack.vaulta.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private UserService userService;

    @Test
    void deleteUser_ShouldThrowException_WhenUserHasBalance() {
        Long userId = 1L;
        User fakeUser = new User();

        Account accountWithMoney = new Account();
        accountWithMoney.setBalance(new BigDecimal("100.00")); // User has $100
        fakeUser.setAccounts(List.of(accountWithMoney));

        when(userRepository.findById(userId)).thenReturn(Optional.of(fakeUser));

        assertThrows(BusinessLogicException.class, () -> userService.deleteUser(userId));

        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUser_ShouldSucceed_WhenBalanceIsZero() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        Account emptyAccount = new Account();
        emptyAccount.setAccountNumber("ACC123");
        emptyAccount.setBalance(BigDecimal.ZERO);
        user.setAccounts(List.of(emptyAccount));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUser(userId);

        verify(accountService, times(1)).closeAccount("ACC123");

        verify(userRepository).delete(user);

        assertEquals(Status.CLOSED, user.getStatus());
    }
}
