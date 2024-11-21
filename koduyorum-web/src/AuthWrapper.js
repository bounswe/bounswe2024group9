import React, { useEffect } from 'react';

const AuthWrapper = ({ children }) => {
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/check_token/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 401) {
                    console.log('Received 401 Unauthorized - Redirecting to login');
                    window.location.href = '/login';
                    return;
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                console.log('Redirecting to login');
                window.location.href = '/login';
                return;
            }
        };

        verifyToken();
    }, []); // Empty dependency array

    return <>{children}</>;
};

export default AuthWrapper;
