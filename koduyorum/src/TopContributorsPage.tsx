import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TopContributorsPage = () => {
    const navigation = useNavigation();
    const [contributors, setContributors] = useState([]);

    useEffect(() => {
        const fetchContributors = async () => {
            try {
                const response = await fetch('http://10.0.2.2:8000/get_top_five_contributors/');
                const data = await response.json();
                if (response.ok) {
                    const enrichedContributors = await Promise.all(
                        data.users.map(async (user) => {
                            const profileResponse = await fetch(
                                `http://10.0.2.2:8000/get_user_profile_by_username/${user.username}`
                            );
                            const profileData = await profileResponse.json();
        
                            // Construct full URL for the profile picture
                            const baseURL = 'http://10.0.2.2:8000';
                            return {
                                ...user,
                                profile_pic: profileData.user?.profile_pic
                                    ? `${baseURL}${profileData.user.profile_pic}` // Prepend base URL to profile_pic
                                    : null,
                            };
                        })
                    );
                    setContributors(enrichedContributors);
                } else {
                    Alert.alert('Error', data.error || 'Failed to fetch contributors');
                }
            } catch (error) {
                console.error('Error fetching contributors:', error);
                Alert.alert('Error', 'Failed to load contributors');
            }
        };
        

        fetchContributors();
    }, []);

    const handlePressContributor = (username, user_id) => {
        navigation.navigate('ProfilePage', { username, user_id });
    };

    const renderContributor = ({ item }) => (
        <TouchableOpacity
            style={styles.contributorCard}
            onPress={() => handlePressContributor(item.username, item.user_id)}
        >
            <Image
                source={{ uri: item.profile_pic || 'https://via.placeholder.com/50' }} // Default placeholder image
                style={styles.profileImage}
                onError={({ nativeEvent: { error } }) =>
                    console.log('Error loading profile image:', error)
                }
            />
            <View style={styles.detailsContainer}>
                <Text style={styles.name}>
                    {item.name} {item.surname}
                </Text>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.contributionPoints}>
                    Contribution Points: {item.contribution_points}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Top Contributors</Text>
            <FlatList
                data={contributors}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderContributor}
                ListEmptyComponent={<Text style={styles.emptyText}>No contributors found</Text>}
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    contributorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 14,
        color: '#555',
    },
    contributionPoints: {
        fontSize: 14,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#aaa',
        marginTop: 20,
    },
});

export default TopContributorsPage;
