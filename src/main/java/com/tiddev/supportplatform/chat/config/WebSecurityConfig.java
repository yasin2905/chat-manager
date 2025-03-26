package com.tiddev.supportplatform.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.Principal;

@Configuration
public class WebSecurityConfig {

    @Bean
    public Principal userPrincipal() {
        return () -> "anonymous";
    }
}
