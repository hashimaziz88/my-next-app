"use client"
import React, { useReducer, useContext, useEffect } from "react";
import { INITIAL_STATE, AuthActionContext, AuthStateContext, IUserLoginRequest, IUserRegisterRequest, IUserLoginResponse } from "./context";
import { AuthReducer } from "./reducer";
import {
    loginPending, loginSuccess, loginError,
    registerPending, registerSuccess, registerError,
    logoutPending, logoutSuccess, logoutError,
    getMePending, getMeSuccess, getMeError
} from "./actions";
import { axiosInstance } from "../../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_LINK + "/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
    const instance = axiosInstance();
    const router = useRouter();

    const login = async (payload: IUserLoginRequest) => {
        dispatch(loginPending());
        const endpoint = `${BASE_URL}/login`;
        console.log(payload);

        await instance.post(endpoint, payload)
            .then((response) => {
                dispatch(loginSuccess(response.data));
                console.log(response.data);

                sessionStorage.setItem('token', response.data.token);
                const token = jwtDecode(response.data.token);
                console.log(token);

                // sessionStorage.setItem('userRole', token);
                // sessionStorage.setItem('userId', token)
                router.push("/dashboard");

            }).catch((error) => {
                dispatch(loginError());
                console.log(error.message);
            })
    };

    const register = async (payload: IUserRegisterRequest) => {
        dispatch(registerPending());
        const endpoint = `${BASE_URL}/register`;
        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (!response.ok) throw new Error("Registration failed");
                return response.json();
            })
            .then((data: IUserLoginResponse) => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    dispatch(registerSuccess(data));
                } else {
                    dispatch(registerError());
                }
            })
            .catch((error) => {
                console.error(error);
                dispatch(registerError());
            });
    };

    const logout = async () => {
        dispatch(logoutPending());
        await Promise.resolve()
            .then(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                dispatch(logoutSuccess());
            })
            .catch((error) => {
                console.error("Logout error:", error);
                dispatch(logoutError());
            });
    };

    const getMe = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch(getMePending());
            const endpoint = `${BASE_URL}/me`;
            await fetch(endpoint, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Token validation failed");
                    }
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user: IUserLoginResponse = JSON.parse(userStr);
                        dispatch(getMeSuccess(user));
                    } else {
                        throw new Error("User data not found in storage");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    // If token is invalid or user data is missing, logout
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    dispatch(getMeError());
                });
        }
    };

    useEffect(() => {
        getMe();
    }, []);

    return (
        <AuthStateContext.Provider value={state}>
            <AuthActionContext.Provider value={{ login, register, logout, getMe }}>
                {children}
            </AuthActionContext.Provider>
        </AuthStateContext.Provider>
    );
};

export const useAuthState = () => {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error("useAuthState must be used within an AuthProvider");
    }
    return context;
};

export const useAuthActions = () => {
    const context = useContext(AuthActionContext);
    if (context === undefined) {
        throw new Error("useAuthActions must be used within an AuthProvider");
    }
    return context;
};
