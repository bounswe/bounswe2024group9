import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, TouchableHighlight, StyleSheet, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
            const response = await fetch(Config.REACT_APP_API_URL+'/database_search/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });
            //console.log("Request data:", JSON.stringify({ username, password }));
            if (!response.ok) {
                const errorResponse = await response.text();  // Get text response to understand the backend error
                console.log("Login failed with response:", errorResponse);
                setError("Invalid username or password! Please try again.");
                setTimeout(() => setError(''), 2000); // Clear the error message after 2 seconds
                return;
            }
            //assuming django server returns user data with successful login
            const userData = await response.json();
            setSuccess('Login successful! Logging you in...');
            setTimeout(() => {
                navigation.navigate('WikidataSearch', { userData }); // Navigate after showing success message
                }, 2000); //navigate to WikidataSearch page after login (endpoint can change)
        }
        catch (error) {
            //any unexpected error
            setError(error.message);
            console.log(error.message);
            setTimeout(() => setError(''), 2000);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        //navigate to sign up page
        navigation.navigate('Signup');
    };

    const handleLoginWithGoogle = () => {
        // NOT IMPLEMENTED YET
        //navigate to WikidataSearch page after login (endpoint can change)
        navigation.navigate('CreateRoute');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text
                style={{
                color: 'black',
                fontSize: 60,
                textAlign: 'center',
                marginTop: 60,
                fontWeight: 'bold',
                }}>
                Login
            </Text>

            <Text
                style={{
                color: 'black',
                marginBottom: 20,
                }}>
                Don't have an account?  
                <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.signupButton}> Sign Up</Text>
                </TouchableOpacity>
            </Text>

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.scrollView}>
    
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
    inputContainer: {
      width: '80%',
      marginBottom: 10,
      alignSelf: 'center', // Center the input container horizontally
    },
    label: {
      marginBottom: 2,
      color: 'black',
      textAlign: 'left',
    },
    scrollView: {
      width: '100%',
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
    signupButton: {
      color: 'blue',
      textDecorationLine: 'underline',
      marginBottom: -3
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