import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();
export const UserProvider = ({ children }) => {
       const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('userData');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Lỗi parse dữ liệu người dùng từ localStorage:", error);
            return null;
        }
    });

    const [topRankers, setTopRankers] = useState([]);


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            localStorage.removeItem('userData');
        }
    }, [user]);

    const value = {
        user,
        setUser,
        topRankers,
        setTopRankers,
        loading,
        setLoading
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};