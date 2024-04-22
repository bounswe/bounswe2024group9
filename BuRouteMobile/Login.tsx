import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://backend-server-placeholder/login/', {
                //send post request to backend server
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });

            if (!response.ok) {
                //username and password dismatch
                throw new Error('Invalid username or password');
            }
            //assuming django server returns user data with successful login
            const userData = await response.json();
        } catch (error) {
            //any unexpected error
            setError(error.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextInput
                style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

export default Login;
