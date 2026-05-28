package com.coltefinanciera.itdashboard.security;

import com.coltefinanciera.itdashboard.identity.entity.AppUser;
import com.coltefinanciera.itdashboard.identity.entity.Permission;
import com.coltefinanciera.itdashboard.identity.entity.Role;
import com.coltefinanciera.itdashboard.identity.repository.AppUserRepository;
import com.coltefinanciera.itdashboard.identity.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class OracleUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(OracleUserDetailsService.class);

    private final AppUserRepository userRepository;

    public OracleUserDetailsService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String principal) throws UsernameNotFoundException {
        String email = AuthService.normalizeEmail(principal);
        AppUser user = userRepository.findByEmailIgnoreCaseAndDeleted(email, "N")
                .orElseThrow(() -> {
                    log.warn("Authentication failed: email '{}' not found or deleted", email);
                    return new UsernameNotFoundException("Usuario no encontrado");
                });

        if (!user.isActive()) {
            log.warn("Authentication failed: email '{}' is inactive", email);
            throw new UsernameNotFoundException("Usuario inactivo");
        }

        return User.withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(authorities(user))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    private Collection<? extends GrantedAuthority> authorities(AppUser user) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        for (Role role : user.getRoles()) {
            if (!isActive(role)) {
                continue;
            }
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode()));
            for (Permission permission : role.getPermissions()) {
                if (isActive(permission)) {
                    authorities.add(new SimpleGrantedAuthority("PERM_" + permission.getCode()));
                }
            }
        }
        return authorities;
    }

    private boolean isActive(Role role) {
        return "Y".equals(role.getActive()) && !role.isDeleted();
    }

    private boolean isActive(Permission permission) {
        return "Y".equals(permission.getActive()) && !permission.isDeleted();
    }
}
