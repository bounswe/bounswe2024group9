import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const PostDetail = ({ route }) => {
    const { post } = route.params;
    
    // State to hold the new comment input
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(post.mockComments);

    // Function to handle adding a new comment
    const handleAddComment = () => {
        if (newComment.trim() === '') {
            Alert.alert('Comment cannot be empty');
            return;
        }

        const newCommentObj = {
            comment_id: comments.length + 1, // will be passed i think but may change when i connect to backed
            text: newComment,
            user: 'currentUser', 
        };

        setComments([...comments, newCommentObj]);
        setNewComment(''); 
    };

    const renderComments = () => {
        return comments.map((comment) => (
            <View key={comment.comment_id} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.user}:</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
            </View>
        ));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>

            <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Code Snippet:</Text>
                <SyntaxHighlighter language={post.programmingLanguage.toLowerCase()} style={atomOneDark}>
                    {post.codeSnippet}
                </SyntaxHighlighter>
            </View>

            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Comments:</Text>
                {renderComments()}
            </View>

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
    codeContainer: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    codeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
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

export default PostDetail;
