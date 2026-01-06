package com.github.sleepystack.vaulta.entity;

import com.github.sleepystack.vaulta.entity.enumeration.Role;
import com.github.sleepystack.vaulta.entity.enumeration.Status;
import com.github.sleepystack.vaulta.exception.BusinessLogicException;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@SoftDelete
@Table(name = "users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Account> accounts;

    @Column(nullable = false)
    private Status status;

    private int tokenVersion = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void addAccount(Account account) {
        this.accounts.add(account);
        account.setUser(this);
    }

    public void ensureCanPerformActions() {
        if (this.status != Status.ACTIVE) {
            throw new BusinessLogicException("User profile '" + this.username + "' is " + this.status + ". Access denied.");
        }
    }
}