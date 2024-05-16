import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import RouteCard from './RouteCard';

const RouteList = ({ route }) => {
    const { qId, currentUser } = route.params;
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getLastItem = (thePath) => {
        if (thePath.endsWith('/')) {
            thePath = thePath.slice(0, -1);
        }
        const numericPart = thePath.replace(/\D/g, '');
        return numericPart;
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/routes/by_qid/${getLastItem(route.params.qValue)}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonData = await response.json();
            setRoutes(jsonData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
    }

    if (error) {
        return <Text style={styles.centered}>Error: {error.message}</Text>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={routes}
                keyExtractor={(item) => item.route_id.toString()}
                renderItem={({ item }) => <RouteCard route={item} currentUser={currentUser} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        padding: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RouteList;
