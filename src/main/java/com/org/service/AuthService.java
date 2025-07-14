package com.org.service;

import com.org.dto.request.LoginRequest;
import com.org.dto.request.SignupRequest;
import com.org.dto.response.AuthResponse;
import com.org.exception.RoleNotFoundException;
import com.org.exception.UserAlreadyExistsException;
import com.org.exception.UserNotFoundException;
import com.org.mapper.UserMapper;
import com.org.model.Role;
import com.org.model.User;
import com.org.repository.RoleRepository;
import com.org.repository.UserRepository;
import com.org.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
    }

    public void signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException(request.username());
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RoleNotFoundException("USER"));

        User user = UserMapper.toEntity(request, passwordEncoder.encode(request.password()), userRole);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException(request.username()));

        String token = JwtUtil.generateToken(user.getUsername(), user.getRole().getName());
        return new AuthResponse(token);
    }
}
