import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login'; // Adjust the import path as needed
import WikidataSearch from './WikidataSearch'; // Adjust the import path as needed

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="WikidataSearch" component={WikidataSearch} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
