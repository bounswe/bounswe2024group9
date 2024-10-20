import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, TouchableHighlight, StyleSheet, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

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
            const response = await fetch('/django_app/login/', {
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
                // navigation.navigate('Feed', { username });
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
            {/* Container for image and title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Log in to </Text>
                    <Image 
                        source={require('../assets/login_logo.png')}
                        style={styles.logo} 
                    />
            </View>

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
                        placeholderTextColor="#9E9E9E"
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
                        placeholderTextColor="#9E9E9E"
                    />
                </View>
                <View style={styles.messageContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6200EE" />
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
                        activeOpacity={0.8}
                        underlayColor="#5E35B1"
                        style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
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
        backgroundColor: '#F5F5F5',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    title: {
        color: '#00BFFF',
        fontSize: 50,
        textAlign: 'center',
        marginTop: 60,
        fontWeight: 'bold',
    },
    logo: {
        width: 120,
        height: 80,
        marginLeft: 8,
        marginBottom: -70,
        resizeMode: 'contain',
    },
    subtitle: {
        color: '#00BFFF',
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    signupButton: {
        color: '#00BFFF',
        textDecorationLine: 'underline',
        marginBottom: -3,
        fontSize: 16,
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
        color: '#00BFFF',
        textAlign: 'left',
        fontSize: 16,
    },
    input: {
        textAlign: 'left',
        height: 50,
        borderColor: '#00BFFF',
        borderRadius: 17,
        borderWidth: 1,
        paddingHorizontal: 10,
        backgroundColor: '#F0F8FF',
        width: '100%',
        fontSize: 16,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        height: 58,
        borderRadius: 17,
        borderWidth: 2,
        backgroundColor: '#00BFFF',
        borderColor: '#00BFFF',
        elevation: 6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
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
