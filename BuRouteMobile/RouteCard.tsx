import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';

const RouteCard = ({ route, currentUser }) => {
    const { route_id, title, description, photos, mapView, user_id, likes: initialLikes, comments: initialComments } = route;
    const [user, setUser] = useState(null);
    const [likes, setLikes] = useState(initialLikes);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:8000/database_search/users/${user_id}/`);
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

    const handleFollow = async () => {
        console.log(route);
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/follow_user/`, {
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
            console.log(result.message);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/like_route/`, {
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
        console.log(currentUser);
        try {
            const response = await fetch(`http://10.0.2.2:8000/database_search/add_comment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id : currentUser.user_id, route_id : route_id, comment : newComment }),
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

    if (!user) {
        return null;
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={{ uri: user.profile_picture }} style={styles.profilePicture} />
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{route.username}</Text>
                </View>
                <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                    <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.routeInfo}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.routeUsername}></Text>
            </View>
            <FlatList
                data={photos}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photo} />}
            />
            <Image source={{ uri: mapView }} style={styles.mapView} />
            <View style={styles.footer}>
                <Text style={styles.likes}>Liked by {likes} others</Text>
                <Text style={styles.description}>{description}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Text style={styles.actionButtonText}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Comment</Text>
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
                    <Text style={styles.submitButtonText}>Post</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 10,
    },
    routeUsername: {
        color: 'gray',
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
