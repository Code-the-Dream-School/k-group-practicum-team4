import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getAuthToken, setAuthToken, clearAuth, getAuthUser, setAuthUser } from '../api/apiClient';

interface User {
    id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: { firstName: string; lastName: string; email: string; password: string; avatar: string }) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be wrapped in AuthProvider");
    return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await getAuthToken();
                if (token) {
                    const storedUser = await getAuthUser();
                    if (storedUser) {
                        setUser({ ...storedUser, email: 'from-storage' }); // adjust as needed
                    }
                }
            } catch (err) {
                console.warn('No valid session found');
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { token, user: apiUser } = await loginUser({ email, password });
            await setAuthToken(token);
            // Store user info if needed (displayName/avatarId)
            await setAuthUser({ displayName: apiUser.displayName, avatarId: '' }); // adjust
            setUser({ email, displayName: apiUser.displayName });
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (data: { firstName: string; lastName: string; email: string; password: string; avatar: string }) => {
        setIsLoading(true);
        try {
            const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            const { token, user: apiUser } = await registerUser({
                displayName,
                email: data.email,
                password: data.password,
                avatarId: data.avatar,
            });
            await setAuthToken(token);
            await setAuthUser({ displayName: apiUser.displayName, avatarId: data.avatar });
            setUser({ email: data.email, displayName: apiUser.displayName, avatar: data.avatar });
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
