package com.jobportal.security;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user;
        try {
            Long id = Long.parseLong(identifier);
            user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        } catch (NumberFormatException e) {
            user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        }

        return org.springframework.security.core.userdetails.User.builder()
            .username(String.valueOf(user.getId()))
            .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
            .authorities(List.of(new SimpleGrantedAuthority(user.getRole().name())))
            .build();
    }
}
