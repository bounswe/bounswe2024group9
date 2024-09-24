import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import Config from 'react-native-config';


const RouteCard = ({ route, currentUser }) => {
    const { route_id, title, description, photos, mapView, user_id, likes: initialLikes, comments: initialComments, node_names } = route;
    const [user, setUser] = useState(null);
    const [likes, setLikes] = useState(initialLikes);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const defaultProfilePicture = require('./profile.jpg');
    const defaultMapView = require('./map.jpg');

    const nodes = node_names ? node_names.split(',') : [];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/users/${user_id}/`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const userData = await response.json();
                console.log(userData);
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, [user_id]);

    useEffect(() => {
        const checkFollowingStatus = async () => {
            try {
                const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/check_following/${user_id}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: currentUser.user_id }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                setIsFollowing(result.isFollowing);
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        };
        checkFollowingStatus();
    }, [user_id, currentUser.user_id]);

    useEffect(() => {
        const checkBookmarkStatus = async () => {
            try {
                const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/check_bookmark/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: currentUser.user_id, route_id }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                setIsBookmarked(result.isBookmarked);
            } catch (error) {
                console.error('Error checking bookmark status:', error);
            }
        };
        checkBookmarkStatus();
    }, [route_id, currentUser.user_id]);

    const handleFollow = async () => {
        try {
            const endpoint = isFollowing ? 'unfollow_user' : 'follow_user';
            const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ follow_user_id: user_id, user_id: currentUser.user_id }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setIsFollowing(!isFollowing);
            console.log(result.message);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/like_route/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUser.user_id, route_id }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setLikes(result.likes);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleComment = async () => {
        try {
            const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/add_comment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUser.user_id, route_id, comment: newComment }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setComments(result.comments);
            setNewComment('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/bookmark_route/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: currentUser.user_id, route_id }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setIsBookmarked(result.bookmarked);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleNodeClick = (nodeName) => {
        // Alert.alert('Node Clicked', `You clicked on node: ${nodeName}`);
    };

    if (!user) {
        return null;
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={defaultProfilePicture} style={styles.profilePicture} />
                <View style={styles.userInfo}>
                    {console.log(user)}
                    <Text style={styles.username}>{user.fields.username}</Text>
                </View>
                <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                    <Text style={styles.followButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.routeInfo}>
                <Text style={styles.title}>{title}</Text>

                <FlatList
                    data={nodes}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleNodeClick(item)}>
                            <Text style={styles.nodeName}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            <FlatList
                data={photos}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Image source={defaultPhoto} style={styles.photo} />}
            />
            <Image source={defaultMapView} style={styles.mapView} />
            <View style={styles.footer}>
                <Text style={styles.likes}>Liked by {likes} others</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Text style={styles.actionButtonText}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                        <Text style={styles.actionButtonText}>{isBookmarked ? 'Unbookmark' : 'Bookmark'}</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={comments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text style={styles.comment}>{item}</Text>}
                />
                <TextInput
                    style={styles.commentInput}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleComment}>
                    <Text style={styles.submitButtonText}>Comment</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'column',
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
    },
    routeInfo: {
        flexDirection: 'column',
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        color: 'black',
    },
    nodeName: {
        marginRight: 10,
        padding: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    followButton: {
        backgroundColor: '#1DA1F2',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    photo: {
        width: 100,
        height: 100,
        marginRight: 5,
        borderRadius: 10,
    },
    mapView: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginTop: 10,
    },
    footer: {
        marginTop: 10,
    },
    likes: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        color: 'gray',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: '#1DA1F2',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    comment: {
        marginTop: 5,
        color: 'gray',
    },
    commentInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        marginTop: 10,
        color: 'gray',

    },
    submitButton: {
        backgroundColor: '#1DA1F2',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 5,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RouteCard;
