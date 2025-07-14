package com.org.mapper;

import com.org.dto.request.SignupRequest;
import com.org.model.Role;
import com.org.model.User;

public class UserMapper {
    public static User toEntity(SignupRequest req, String encodedPassword, Role role) {
        return User.builder()
                .username(req.username())
                .password(encodedPassword)
                .role(role)
                .build();
    }
}
