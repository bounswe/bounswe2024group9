import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import QuestionCard from './QuestionCard';
import { useNavigation } from '@react-navigation/native';

const BookmarksPage = ({ route }) => {
    const { user_id, username, bookmarksData } = route.params;
    const [bookmarks, setBookmarks] = useState(bookmarksData || []);
    const [loading, setLoading] = useState(!bookmarksData);
    const navigation = useNavigation();

    useEffect(() => {
        
            const fetchBookmarks = async () => {
                try {
                    const response = await fetch(`http://10.0.2.2:8000/get_user_profile_by_id/${user_id}/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch bookmarks');
                    }
                    const data = await response.json();
                    setBookmarks(data.user.bookmarks);
                } catch (error) {
                    console.error('Error fetching bookmarks:', error);
                    Alert.alert('Error', 'Failed to load bookmarks');
                } finally {
                    setLoading(false);
                }
            };

            fetchBookmarks();
        
    }, [user_id, bookmarksData]);

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

    if (!bookmarks || bookmarks.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bookmarks available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bookmarked Questions</Text>
            <FlatList
                data={bookmarks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <QuestionCard
                        post={{
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            user_id: item.user_id,
                            likes: item.upvotes,
                            programmingLanguage: item.programmingLanguage,
                            tags: item.tags,
                            answered: item.answered,
                            codeSnippet: item.codeSnippet,
                            upvoted_by: item.is_upvoted ? [username] : [],
                            downvoted_by: item.is_downvoted ? [username] : [],
                            post_type: item.post_type,
                        }}
                        currentUser={{ id: user_id, username }}
                        onPress={handlePostPress}
                    />
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default BookmarksPage;
