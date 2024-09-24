import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WikidataSearch from './WikidataSearch';
import SearchResultDetail from './SearchResultDetail';
import NodeCreationPage from './NodeCreationPage';
import NodeDetails from './SearchResultDetailCustomNode';
import CreateRoute from './RouteCreation';
import Login from './Login';
import Signup from './Signup.tsx';
import RouteList from './RouteList.tsx';
import Feed from './Feed';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
            name="Login"
            component={Login}
          />
        <Stack.Screen
          name="WikidataSearch"
          component={WikidataSearch}
          options={{ title: 'Wikidata Search' }}
        />
        <Stack.Screen
          name="SearchResultDetail"
          component={SearchResultDetail}
          options={{ title: 'Search Result Detail' }}
        />
        <Stack.Screen
          name="NodeCreationPage"
          component={NodeCreationPage}
          options={{ title: 'Node Creation Page' }}
        />
        <Stack.Screen
            name="NodeDetails"
            component={NodeDetails}
            options={{ title: 'Custom node view page' }}
        />
        <Stack.Screen
            name="CreateRoute"
            component={CreateRoute}
            options={{ title: 'Route creation page' }}
        />
        <Stack.Screen
            name="Signup" 
            component={Signup}
        />
        <Stack.Screen
            name="RouteList" 
            component={RouteList}
        />
        <Stack.Screen
           name="Feed"
           component={Feed}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
