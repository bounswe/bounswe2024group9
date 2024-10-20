import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TouchableHighlight, StyleSheet, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
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
        if (!username || !password) {
            setError('Please fill in all fields!');
            setTimeout(() => setError(''), 2000);
            return;
        }
    
        setLoading(true);
    
        const url ='http://10.0.2.2:8000/login/';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();  // Parse the JSON response
    
            if (response.ok && data.status === 'success') {
                setSuccess('Login successful! Logging you in...');
    
                // Extract user_id from the response
                const { user_id } = data;
    
                setTimeout(() => {
                    navigation.navigate('QuestionList', { username, user_id });
                }, 2000);
            } else {
                setError("Invalid username or password! Please try again.");
                setTimeout(() => setError(''), 2000);
            }
    
        } catch (error) {
            setError('Login failed, please try again later.');
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
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Log in to</Text>
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
        backgroundColor: '#F5F5F5',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
    logo: {
        width: 120,
        height: 80,
        marginLeft: 10,
        marginBottom: -5,
        resizeMode: 'contain',
    },
    subtitle: {
        color: '#555',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    signupButton: {
        color: '#00BFFF',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    scrollView: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        color: '#555',
        fontSize: 16,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    messageContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
    },
    error: {
        color: 'red',
    },
    success: {
        color: 'green',
    },
    buttonContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00BFFF',
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Login;
