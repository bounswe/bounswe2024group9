import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
//import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    //const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
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
                //username and password mismatch
                throw new Error('Invalid username or password');
            }
            //assuming django server returns user data with successful login
            const userData = await response.json();
            navigation.navigate('WikidataSearch', { userData }); //navigate to Home page after login (home endpoint can change)
        }

        catch (error) {
            //any unexpected error
            setError(error.message);
        }
    };

    const handleSignUp = () => {
        //navigate to sign up page
        navigation.navigate('SignUp');
    };

    const handleLoginWithGoogle = () => {
        // NOT IMPLEMENTED YET
        //navigate to Home page after login (endpoint can change)
        navigation.navigate('WikidataSearch');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleSignUp}>
                <Text style={{ marginBottom: 20, color: 'blue' }}>Sign Up</Text>
            </TouchableOpacity>

            <TextInput
                style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />

            {error ? <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text> : null}

            <Button title="Login" onPress={handleLogin} style={{marginTop: 20, marginBottom: 20}}/>

            <Button title="Login with Google" onPress={handleLoginWithGoogle} style={{marginTop: 20, marginBottom: 20}}/>
        </View>
    );
};

export default Login;
