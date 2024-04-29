import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
//import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Login = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); 
    //const [rememberMe, setRememberMe] = useState(false);
    //const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            setUsername('');
            setPassword('');
            setError('');
            setSuccess('');
        }, [])
    );

    const handleLogin = async () => {
        try {
            const response = await fetch('http://10.0.2.2:8000/database_search/login/', {
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
                setError("Invalid username or password");
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
    };

    const handleSignUp = () => {
        //navigate to sign up page
        navigation.navigate('Signup');
    };

    const handleLoginWithGoogle = () => {
        // NOT IMPLEMENTED YET
        //navigate to WikidataSearch page after login (endpoint can change)
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
            {success ? <Text style={{ color: 'green', marginBottom: 20 }}>{success}</Text> : null}

            <Button title="Login" onPress={handleLogin} style={{marginTop: 20, marginBottom: 20}}/>

            <Button title="Login with Google" onPress={handleLoginWithGoogle} style={{marginTop: 20, marginBottom: 20}}/>
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
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: 300,
      height: 58,
      borderRadius: 17,
      borderWidth: 2,
      backgroundColor: '#e0eaFF',
    },
    buttonText: {
      color: 'black',
    },
});


export default Login;
