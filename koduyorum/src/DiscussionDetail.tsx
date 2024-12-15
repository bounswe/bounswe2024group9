import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';

const DiscussionDetail = ({ route }) => {
    const { post, user_id, username } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:8000/question/${post.id}/comments/`);
                const data = await response.json();
                if (response.status === 200) {
                    setComments(data.comments);
                } else {
                    Alert.alert('Error', data.error || 'Failed to fetch comments');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch comments');
            }
        };
        fetchComments();
    }, [post.id]);

    const handleAddComment = async () => {
        if (newComment.trim() === '') {
            Alert.alert('Error', 'Comment cannot be empty');
            return;
        }

        try {
            const response = await fetch(`http://10.0.2.2:8000/create_comment/${post.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify({ details: newComment }),
            });

            const data = await response.json();

            if (response.status === 201) {
                setComments([...comments, {
                    comment_id: data.comment_id,
                    details: newComment,
                    user: username,
                }]);
                setNewComment('');
            } else {
                Alert.alert('Error', data.error || 'Failed to add comment');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add comment');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            {post.description ? (
                <Text style={styles.description}>{post.description}</Text>
            ) : null}
            {post.author ? (
                <Text style={styles.metadata}>
                    Author: <Text style={styles.metadataValue}>{post.author}</Text>
                </Text>
            ) : null}
            {post.date ? (
                <Text style={styles.metadata}>
                    Posted on: <Text style={styles.metadataValue}>{post.date}</Text>
                </Text>
            ) : null}

            {/* Comments Section */}
            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Discussion Comments:</Text>
                {comments.map((comment, index) => (
                    <View key={index} style={styles.comment}>
                        <Text style={styles.commentUser}>{comment.user}:</Text>
                        <Text style={styles.commentText}>{comment.details}</Text>
                    </View>
                ))}
            </View>

            {/* Add Comment */}
            <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddComment}>
                <Text style={styles.addButtonText}>Submit Comment</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    metadata: {
        fontSize: 14,
        color: '#555',
    },
    metadataValue: {
        fontWeight: 'bold',
    },
    commentsContainer: {
        marginTop: 20,
    },
    commentHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comment: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    commentUser: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#00BFFF',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default DiscussionDetail;
