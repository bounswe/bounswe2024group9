import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import RouteCard from './RouteCard';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Assuming you have react-native-vector-icons installed

const Feed = ({ route }) => {
    const { username } = route.params;
    const [data, setData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigation = useNavigation();

    const fetchUserData = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/user_detail/?username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const userData = await response.json();
            console.log(userData);
            setCurrentUser(userData);
        } catch (error) {
            setError(error);
        }
    };

    const fetchFeedData = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/load_feed/?username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchFeedData();
    }, []);

    const handleSearchBarPress = () => {
        navigation.navigate('WikidataSearch', {username});
    };

    const handleAddRoutePress = () => {
        navigation.navigate('CreateRoute', { username });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
    }

    if (error) {
        return <Text style={styles.centered}>Error: {error.message}</Text>;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleSearchBarPress} style={styles.searchBar}>
                <Text style={styles.searchText}>Search Wikidata...</Text>
            </TouchableOpacity>
            <FlatList
                data={data}
                keyExtractor={(item) => item.route_id.toString()}
                renderItem={({ item }) => <RouteCard route={item} currentUser={currentUser} />}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddRoutePress}>
                <Icon name="plus" size={30} color="#fff" />
            </TouchableOpacity>
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
    searchBar: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    searchText: {
        color: '#888',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Feed;
