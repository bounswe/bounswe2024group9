import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const PostDetail = ({ route }) => {
    const { post, user_id, username } = route.params;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [codeOutput, setCodeOutput] = useState('');

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
                console.error('Error fetching comments:', error);
                Alert.alert('Error', 'Failed to fetch comments');
            }
        };

        fetchComments();
    }, [post.id]);


    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('localhost/get_api_languages/');
                const data = await response.json();
                const languageNames = Object.keys(data.languages);
                setAvailableLanguages(languageNames);
            } catch (error) {
                Alert.alert('Error', 'Failed to load languages.');
            }
        };

        fetchLanguages();
    }, []);

    const handleAddComment = async () => {
        if (newComment.trim() === '' || selectedLanguage === '') {
            Alert.alert('Comment, language, and code snippet cannot be empty');
            return;
        }

        const newCommentObj = {
            question_id: post.id,
            details: newComment,
            code_snippet: codeSnippet,  // Include code snippet in the request
            language: selectedLanguage,
            user_id: user_id,
        };

        try {
            const response = await fetch('https://clownfish-app-brdp5.ondigitalocean.app/create_comment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCommentObj),
            });

            const data = await response.json();

            if (response.status === 201) {
                setComments([...comments, { comment_id: data.comment_id, details: newComment, code_snippet: codeSnippet, user: username }]);
                setNewComment('');
                setCodeSnippet('');  // Clear code snippet input
            } else {
                Alert.alert('Error', data.error || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert('Error', 'Failed to add comment');
        }
    };

    const handleRunCode = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/run_code/?type=question&id=${post.id}`);
            const data = await response.json();

            if (response.status === 200) {
                setCodeOutput(data.output);
            } else {
                Alert.alert('Error', data.error || 'Failed to run code');
            }
        } catch (error) {
            console.error('Error running code:', error);
            Alert.alert('Error', 'Failed to run code');
        }
    };

    const renderComments = () => {
        return comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.user}:</Text>
                <Text style={styles.commentText}>{comment.details}</Text>

                {comment.code_snippet ? (
                    <SyntaxHighlighter
                        language={selectedLanguage || 'javascript'}
                        style={atomOneDark}
                    >
                        {comment.code_snippet}
                    </SyntaxHighlighter>
                ) : null}
            </View>
        ));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{post.description}</Text>

            <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Code Snippet:</Text>
                <SyntaxHighlighter language={post.programmingLanguage} style={atomOneDark}>
                    {post.codeSnippet}
                </SyntaxHighlighter>
            </View>

            {/* Run Code Button */}
            <TouchableOpacity style={styles.runButton} onPress={handleRunCode}>
                <Text style={styles.runButtonText}>Run Code</Text>
            </TouchableOpacity>

            {/* Display Code Output */}
            {codeOutput ? (
                <View style={styles.outputContainer}>
                    <Text style={styles.outputTitle}>Output:</Text>
                    <Text style={styles.outputText}>{codeOutput}</Text>
                </View>
            ) : null}

            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Comments:</Text>
                {renderComments()}
            </View>

            {/* Language Picker */}
            <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Select a language" value="" />
                {availableLanguages.map((language, index) => (
                    <Picker.Item key={index} label={language} value={language} />
                ))}
            </Picker>

            {/* Input for comment details */}
            <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
            />

            {/* Input for code snippet */}
            <TextInput
                style={styles.codeInput}
                placeholder="Add a code snippet..."
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline={true}
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
    codeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        fontFamily: 'monospace',
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
    runButton: {
        backgroundColor: '#32CD32',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    runButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    outputContainer: {
        backgroundColor: '#e1e1e1',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
    },
    outputTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    outputText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'monospace',
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
    picker: {
        marginVertical: 20,
        height: 50,
        width: '100%',
    },
});

export default PostDetail;
