package com.coltefinanciera.itdashboard.security;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

final class SetSupport {

    private SetSupport() {
    }

    static Set<String> copyOf(Collection<?> values) {
        if (values == null) {
            return Set.of();
        }
        return values.stream().map(String::valueOf).collect(Collectors.toUnmodifiableSet());
    }
}
