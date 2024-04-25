import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WikidataSearch from './WikidataSearch';
import SearchResultDetail from './SearchResultDetail';
import NodeCreationPage from './NodeCreationPage'

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WikidataSearch">
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
          options={{ title: 'Node Creation Page' }} // Optional: You can set a title for this screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
