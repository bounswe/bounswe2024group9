import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    PanResponder,
    Animated,
    Image,
} from 'react-native';
import QuestionCard from './QuestionCard';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

const QuestionList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { username, user_id } = route.params;

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [feedQuestions, setFeedQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [profilePic, setProfilePic] = useState(null); // Store profile picture
    const [questionCount, setQuestionCount] = useState(0); // Store number of questions shared

    const translateX = useRef(new Animated.Value(0)).current;
    const panelWidth = 200; // Width of the profile panel

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx < -50 && !isPanelOpen) {
                // Swipe left to open the profile panel
                Animated.timing(translateX, {
                    toValue: -panelWidth,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setIsPanelOpen(true);
                });
            } else if (gestureState.dx > 50 && isPanelOpen) {
                // Swipe right to close the profile panel
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setIsPanelOpen(false);
                });
            }
        },
        onPanResponderRelease: () => {
            // Ensure the panel stays open or closed after the gesture ends
            if (isPanelOpen) {
                Animated.timing(translateX, {
                    toValue: -panelWidth,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    // Fetch user-specific feed
    const fetchFeed = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/specific_feed/${user_id}/`);
            const data = await response.json();
            setFeedQuestions(data.questions);
        } catch (error) {
            console.error('Error fetching user-specific feed:', error);
            Alert.alert('Error', 'Failed to load feed');
        }
    };

    // Fetch user profile to get profile picture and question count
    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/get_user_profile_by_id/${user_id}/`);
            const data = await response.json();
            setProfilePic(data.user.profile_pic || null);
            setQuestionCount(data.user.questions.length || 0);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user_id]);

    // Fetch feed when the screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchFeed();
        }, [])
    );

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    // Fetch filtered questions when debouncedQuery changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.trim() === '') {
                setIsSearching(false);
                setFilteredQuestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const response = await fetch(
                    `http://10.0.2.2:8000/multi_search?query=${encodeURIComponent(debouncedQuery)}`
                );
                const data = await response.json();
                if (response.ok) {
                    setFilteredQuestions([...data.tag_results, ...data.language_results]);
                } else {
                    console.error('Search error:', data.error);
                    Alert.alert('Error', data.error || 'Failed to search');
                }
            } catch (error) {
                console.error('Error performing search:', error);
                Alert.alert('Error', 'Failed to search');
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const handlePostPress = (post: any) => {
        navigation.navigate('PostDetail', { post, user_id, username });
    };

    const handleCreateQuestion = () => {
        navigation.navigate('CreateQuestion', { username, user_id });
    };

    const handleExitApp = () => {
        Alert.alert('Exit', 'Are you sure you want to exit?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => console.log('App exited') }, // Replace with actual exit logic if needed
        ]);
    };

    const renderFeedItem = ({ item }: any) => (
        <QuestionCard post={item} currentUser={user_id} onPress={() => handlePostPress(item)} />
    );

    const renderSearchResult = ({ item }: any) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handlePostPress(item)}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultDetails}>
                {item.tags ? `Tags: ${item.tags.join(', ')}` : `Language: ${item.language}`}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.mainContent, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                {/* Main content */}
                <View style={styles.content}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                        />
                    </View>

                    {isSearching ? (
                        <FlatList
                            data={filteredQuestions}
                            keyExtractor={(item: any) => item.id.toString()}
                            renderItem={renderSearchResult}
                        />
                    ) : (
                        <FlatList
                            data={feedQuestions}
                            keyExtractor={(item: any) => item.id.toString()}
                            renderItem={renderFeedItem}
                        />
                    )}
                </View>

                {/* Floating Button for Question Creation */}
                <TouchableOpacity style={styles.createButton} onPress={handleCreateQuestion}>
                    <Text style={styles.createButtonText}>+</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Profile Panel */}
            <Animated.View
                style={[
                    styles.profilePanel,
                    {
                        transform: [
                            {
                                translateX: translateX.interpolate({
                                    inputRange: [-panelWidth, 0],
                                    outputRange: [0, panelWidth],
                                }),
                            },
                        ],
                    },
                ]}
            >
            <View style={styles.profileContent}>
                <TouchableOpacity
                    style={styles.profileTouchable}
                    onPress={() => navigation.navigate('ProfilePage', { username, user_id })}
                >
                    <Image
                        source={
                            profilePic
                                ? { uri: profilePic }
                                : require('../assets/pp.jpg')
                        }
                        style={styles.profileIcon}
                    />
                     <Text style={styles.username}>@{username}</Text>

                </TouchableOpacity>
                <Text style={styles.questionCount}>{questionCount} Questions Shared</Text>
                <TouchableOpacity
                    style={styles.contributorsButton}
                    onPress={() => navigation.navigate('TopContributors')}
                >
                    <Text style={styles.contributorsText}>Top Contributors</Text>
                </TouchableOpacity>
            </View>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
    },
    resultItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    resultDetails: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    profilePanel: {
        width: 200,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        borderLeftWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        paddingTop: 20,
    },
    profileContent: {
        alignItems: 'center',
    },
    profileIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    questionCount: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
    },
    contributorsButton: {
        width: '90%',
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    contributorsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    exitButton: {
        position: 'absolute',
        bottom: 20,
        width: '90%',
        padding: 10,
        backgroundColor: '#dc3545',
        borderRadius: 8,
        alignItems: 'center',
    },
    exitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    createButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        backgroundColor: '#00BFFF',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default QuestionList;
