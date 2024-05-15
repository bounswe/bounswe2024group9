import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Config from 'react-native-config';

const RouteList = () => {
  const route = useRoute();
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const node = route.params.node;
    fetchRoutes(node);
  }, [route.params.node]);

  const fetchRoutes = async (node) => {
    try {
      const response = await fetch(Config.REACT_APP_API_URL + '/database_search/routes/' + node.Q.value);
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Routes including {route.params.node.itemLabel.value}</Text>
        {routes.map((route, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Route ID: {route.route_id}</Text>
            <Text>Title: {route.title}</Text>
            {/* Add more details if needed */}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default RouteList;
