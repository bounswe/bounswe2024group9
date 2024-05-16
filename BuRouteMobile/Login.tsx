import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, TouchableHighlight, StyleSheet, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Config from 'react-native-config';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setUsername('');
            setPassword('');
            setError('');
            setSuccess('');
            setLoading(false);
        }, [])
    );

    const handleLogin = async () => {
        try {
            if (!username || !password) {
                setError('Please fill in all fields!');
                setTimeout(() => setError(''), 2000);
                return;
            }
            setLoading(true);
            console.log(Config.REACT_APP_API_URL);
            const response = await fetch(Config.REACT_APP_API_URL + '/database_search/login/', {
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
                const errorResponse = await response.text();
                console.log("Login failed with response:", errorResponse);
                setError("Invalid username or password! Please try again.");
                setTimeout(() => setError(''), 2000);
                return;
            }

            setSuccess('Login successful! Logging you in...');
            setTimeout(() => {
                navigation.navigate('Feed', { username });
                }, 2000);
        }
        catch (error) {
            setError(error.message);
            console.log(error.message);
            setTimeout(() => setError(''), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        navigation.navigate('Signup');
    };

    const handleLoginWithGoogle = () => {
        navigation.navigate('CreateRoute', { username });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>
                Don't have an account?  
                <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.signupButton}> Sign Up</Text>
                </TouchableOpacity>
            </Text>
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>USERNAME</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                </View>
                <View style={styles.messageContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="black" />
                    ) : (
                        <>
                            {error ? <Text style={[styles.message, styles.error]}>{error}</Text> : null}
                            {success ? <Text style={[styles.message, styles.success]}>{success}</Text> : null}
                        </>
                    )}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableHighlight
                        onPress={handleLogin}
                        activeOpacity={0.6}
                        underlayColor="#DDDDDD"
                        style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={handleLoginWithGoogle}
                        activeOpacity={0.6}
                        underlayColor="#DDDDDD"
                        style={styles.button}>
                        <Text style={styles.buttonText}>Login with Google</Text>
                    </TouchableHighlight>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'black',
        fontSize: 60,
        textAlign: 'center',
        marginTop: 60,
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'black',
        marginBottom: 20,
    },
    signupButton: {
        color: 'blue',
        textDecorationLine: 'underline',
        marginBottom: -3
    },
    scrollView: {
        width: '100%',
    },
    inputContainer: {
        width: '80%',
        marginBottom: 10,
        alignSelf: 'center',
    },
    label: {
        marginBottom: 2,
        color: 'black',
        textAlign: 'left',
    },
    input: {
        textAlign: 'left',
        height: 50,
        borderColor: 'gray',
        borderRadius: 17,
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: '#e0eaFF',
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        width: 300,
        height: 58,
        borderRadius: 17,
        borderWidth: 2,
        backgroundColor: '#e0eaFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'black',
    },
    messageContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        width: '80%',
    },
    error: {
        color: 'red',
    },
    success: {
        color: 'green',
    },
});

export default Login;
