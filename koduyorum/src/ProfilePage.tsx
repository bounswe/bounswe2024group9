import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import QuestionCard from './QuestionCard';
import { useNavigation } from '@react-navigation/native';

const ProfilePage = ({ route }) => {
    const { username, user_id } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:8000/get_user_profile_by_id/${user_id}/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                setProfile(data.user);
            } catch (error) {
                console.error('Error fetching profile:', error);
                Alert.alert('Error', 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user_id]);

    const handlePostPress = (post) => {
        navigation.navigate('PostDetail', { post, user_id, username });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00BFFF" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load profile.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={
                        profile.profile_pic
                            ? { uri: profile.profile_pic }
                            : require('../assets/pp.jpg')
                    }
                    style={styles.profileImage}
                />
                <Text style={styles.username}>{profile.username}</Text>
            </View>

            <View style={styles.questionsSection}>
                <Text style={styles.sectionTitle}>User Questions</Text>
                {profile.questions && profile.questions.length > 0 ? (
                    <FlatList
                        data={profile.questions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                        <QuestionCard
                            post={{
                                id: item.id,
                                title: item.title,
                                description: item.details,
                                user_id: item.author,
                                likes: item.upvotes,
                                programmingLanguage: item.language,
                                tags: item.tags,
                                answered: item.answered,
                                codeSnippet: item.code_snippet,
                                upvoted_by: item.upvoted_by,
                                downvoted_by: item.downvoted_by,
                            }}
                            currentUser={{ id: user_id, username: profile.username }} // Pass both id and username
                            onPress={handlePostPress}
                        />

                        )}
                    />

                ) : (
                    <Text style={styles.noQuestionsText}>No questions available.</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    bio: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 5,
    },
    questionsSection: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noQuestionsText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default ProfilePage;
