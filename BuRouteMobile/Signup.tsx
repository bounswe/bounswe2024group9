import React, {useState} from 'react';
import {
  TouchableHighlight,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native';
import {NavigationProp} from '@react-navigation/native'; // Import NavigationProp type
import Config from 'react-native-config';

type Props = {
  navigation: NavigationProp<any>; // Define the type of the navigation prop
};

const Signup = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subscribe, setSubscribe] = useState(false);

  const handleSubmit = async () => {
    const userInfo = {username, name: '', email, password, is_superuser: false};
    try {
      console.log(username);
      console.log(email);
      console.log(password);
      console.log(Config.REACT_APP_API_URL);
      console.log(subscribe);
      
      if (!subscribe){
        Alert.alert('You must agree to KVKK to continue!');
      }else{
        const response = await fetch(Config.REACT_APP_API_URL+'/database_search/create_user/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            name: "",
            email: email,
            password: password,
          }),
        });

        const json = await response.json();
        console.log(json);
        if (response.ok) {

          Alert.alert('User saved successfully!');
          setTimeout(() => {
              navigation.navigate('WikidataSearch', {json});
          }, 2000);
        }
    }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Failed to save user.');
    }
  };

  const handleLogin = () => {
    //navigate to sign up page
    navigation.navigate('Login');
  };

  const openKVKKTerms = () => {
    Linking.openURL('https://www.resmigazete.gov.tr/eskiler/2018/03/20180310-5.htm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text
        style={{
          color: 'black',
          fontSize: 60,
          textAlign: 'center',
          marginTop: 60,
          fontWeight: 'bold',
        }}>
        Create New Account
      </Text>
      <Text
        style={{
          color: 'black',
          marginBottom: 20,
        }}>
        Already registered?
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.signupButton}> Log in here.</Text>
        </TouchableOpacity>
      </Text>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={true}
          />
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity
              onPress={() => setSubscribe(!subscribe)} // Toggle subscribe state
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={[
                  styles.checkbox,
                  {backgroundColor: subscribe ? 'blue' : 'transparent'}, // Change color based on state
                ]}
              />
              <Text style={{marginLeft: 8}}>
                I agree to the{' '}
                <Text style={{color: 'blue'}} onPress={openKVKKTerms}>KVKK terms</Text>
              </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight
            onPress={handleSubmit}
            activeOpacity={0.6}
            underlayColor="#DDDDDD">
            <View style={styles.button}>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </View>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  signupButton: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: -3,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'blue',
  },
});

export default Signup;
