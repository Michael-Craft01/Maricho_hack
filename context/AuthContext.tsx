"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Get the custom claims
                const tokenResult = await user.getIdTokenResult();
                setRole(tokenResult.claims.role as string | null);

                // When auth state changes, update the session cookie
                // Logic: if we have a user, ensure the server knows (login/refresh)
                // If we don't, logout. 
                // Note: For this simplified flow, we might handle login explicitly in the component
                // But refreshing the token in background is good practice.
            } else {
                setUser(null);
                setRole(null);
                // Optional: Call logout API to clear cookie if firebase auth is missing
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshUser = async () => {
        if (auth.currentUser) {
            // Force token refresh to get new claims
            await auth.currentUser.getIdToken(true);
            const tokenResult = await auth.currentUser.getIdTokenResult();
            setRole(tokenResult.claims.role as string | null);
            setUser(auth.currentUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
