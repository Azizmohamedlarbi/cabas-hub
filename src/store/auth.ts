'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { type Session } from '@supabase/supabase-js';
import { useCartStore } from '@/store/cart';

export interface User {
    id: string;
    userType: 'seller' | 'buyer' | 'admin';
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
    anaeVerified?: boolean;
    businessName?: string;
    buyerType?: 'b2b' | 'b2c';
    ratingAverage?: number;
    ratingCount?: number;
    plan?: 'free' | 'early_adopter' | 'pro';
    isFounder?: boolean;
    planExpiresAt?: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, metadata: any) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            isLoggedIn: false,
            isLoading: true,

            initialize: async () => {
                set({ isLoading: true });
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Auth Initialize - Session found:', !!session);

                if (!session) {
                    useCartStore.getState().clear();
                }

                if (session) {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error) console.error('Auth Initialize - Profile fetch error:', error);

                    if (profile) {
                        console.log('Auth Initialize - Profile loaded:', {
                            id: profile.id,
                            type: profile.user_type,
                            anaeVerified: profile.anae_verified
                        });
                        set({
                            user: {
                                id: profile.id,
                                userType: profile.user_type,
                                firstName: profile.first_name,
                                lastName: profile.last_name,
                                email: profile.email,
                                phone: profile.phone,
                                profilePhoto: profile.profile_photo,
                                anaeVerified: profile.anae_verified,
                                businessName: profile.business_name,
                                ratingAverage: profile.rating_average,
                                ratingCount: profile.rating_count,
                                plan: profile.plan,
                                isFounder: profile.is_founder,
                                planExpiresAt: profile.plan_expires_at,
                            },
                            session,
                            isLoggedIn: true,
                        });
                    }
                }
                set({ isLoading: false });

                // Listen for changes
                supabase.auth.onAuthStateChange(async (_event, session) => {
                    if (session) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (profile) {
                            set({
                                user: {
                                    id: profile.id,
                                    userType: profile.user_type,
                                    firstName: profile.first_name,
                                    lastName: profile.last_name,
                                    email: profile.email,
                                    phone: profile.phone,
                                    profilePhoto: profile.profile_photo,
                                    anaeVerified: profile.anae_verified,
                                    businessName: profile.business_name,
                                    ratingAverage: profile.rating_average,
                                    ratingCount: profile.rating_count,
                                    plan: profile.plan,
                                    isFounder: profile.is_founder,
                                    planExpiresAt: profile.plan_expires_at,
                                },
                                session,
                                isLoggedIn: true,
                            });
                        }
                    } else {
                        set({ user: null, session: null, isLoggedIn: false });
                    }
                });
            },

            login: async (email, password) => {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) return { success: false, error: error.message };
                    if (!data.user) return { success: false, error: "Utilisateur non trouvé après connexion." };

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    if (profile) {
                        set({
                            user: {
                                id: profile.id,
                                userType: profile.user_type,
                                firstName: profile.first_name,
                                lastName: profile.last_name,
                                email: profile.email,
                                phone: profile.phone,
                                profilePhoto: profile.profile_photo,
                                anaeVerified: profile.anae_verified,
                                businessName: profile.business_name,
                                ratingAverage: profile.rating_average,
                                ratingCount: profile.rating_count,
                                plan: profile.plan,
                                isFounder: profile.is_founder,
                                planExpiresAt: profile.plan_expires_at,
                            },
                            session: data.session,
                            isLoggedIn: true,
                        });
                    }

                    return { success: true };
                } catch (err: any) {
                    console.error("Login fetch error:", err);
                    return { success: false, error: "Erreur de connexion." };
                }
            },

            signUp: async (email, password, metadata) => {
                try {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: metadata,
                            emailRedirectTo: `${origin}/auth/confirm`,
                        },
                    });
                    if (error) return { success: false, error: error.message };

                    // If Supabase returned a session right away → email confirmation is
                    // disabled (dev mode) or the email was already confirmed.
                    // Set store state so the user is logged in immediately.
                    if (data.session && data.user) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', data.user.id)
                            .single();
                        if (profile) {
                            set({
                                user: {
                                    id: profile.id,
                                    userType: profile.user_type,
                                    firstName: profile.first_name,
                                    lastName: profile.last_name,
                                    email: profile.email,
                                    phone: profile.phone,
                                    profilePhoto: profile.profile_photo,
                                    anaeVerified: profile.anae_verified,
                                    businessName: profile.business_name,
                                    ratingAverage: profile.rating_average,
                                    ratingCount: profile.rating_count,
                                    plan: profile.plan,
                                    isFounder: profile.is_founder,
                                    planExpiresAt: profile.plan_expires_at,
                                },
                                session: data.session,
                                isLoggedIn: true,
                            });
                        }
                        return { success: true, needsEmailConfirmation: false };
                    }

                    // No session → confirmation email was sent, user must click the link
                    return { success: true, needsEmailConfirmation: true };
                } catch (err: any) {
                    console.error("SignUp fetch error:", err);
                    return { success: false, error: "Erreur de connexion lors de l'inscription." };
                }
            },


            logout: async () => {
                try {
                    await supabase.auth.signOut();
                } catch (err: any) {
                    console.error("Logout error:", err);
                }
                useCartStore.getState().clear();
                set({ user: null, session: null, isLoggedIn: false });
            },

            updateUser: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                }));
            },

            refreshProfile: async () => {
                const { user, session } = get();
                if (!user || !session) return;

                console.log('Refreshing profile for ID:', user.id);
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Refresh profile error:', error);
                    return;
                }

                if (profile) {
                    console.log('Profile refreshed result:', {
                        anae_verified: profile.anae_verified
                    });
                    set({
                        user: {
                            id: profile.id,
                            userType: profile.user_type,
                            firstName: profile.first_name,
                            lastName: profile.last_name,
                            email: profile.email,
                            phone: profile.phone,
                            profilePhoto: profile.profile_photo,
                            anaeVerified: profile.anae_verified,
                            businessName: profile.business_name,
                            ratingAverage: profile.rating_average,
                            ratingCount: profile.rating_count,
                            plan: profile.plan,
                            isFounder: profile.is_founder,
                            planExpiresAt: profile.plan_expires_at,
                        }
                    });
                }
            },
        }),
        { name: 'cabas-auth', partialize: (state) => ({ isLoggedIn: state.isLoggedIn }) }
    )
);
