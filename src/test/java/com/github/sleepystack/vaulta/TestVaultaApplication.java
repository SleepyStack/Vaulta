package com.github.sleepystack.vaulta;

import org.springframework.boot.SpringApplication;

public class TestVaultaApplication {

    public static void main(String[] args) {
        SpringApplication.from(VaultaApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
