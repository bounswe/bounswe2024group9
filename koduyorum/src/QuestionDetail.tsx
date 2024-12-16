import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomSyntaxHighlighter from './CustomSyntaxHighlighter';

const QuestionDetail = ({ route }) => {
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
                Alert.alert('Error', 'Failed to fetch comments');
            }
        };
        fetchComments();
    }, [post.id]);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('http://10.0.2.2:8000/get_api_languages/');
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
        if (newComment.trim() === '' || selectedLanguage === '' || codeSnippet.trim() === '') {
            Alert.alert('Error', 'Comment, language, and code snippet cannot be empty');
            return;
        }

        const newCommentObj = {
            details: newComment,
            code_snippet: codeSnippet,
            language: selectedLanguage,
        };

        try {
            const response = await fetch(`http://10.0.2.2:8000/create_comment/${post.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(newCommentObj),
            });

            const data = await response.json();

            if (response.status === 201) {
                setComments([...comments, {
                    comment_id: data.comment_id,
                    details: newComment,
                    code_snippet: codeSnippet,
                    user: username,
                }]);
                setNewComment('');
                setCodeSnippet('');
            } else {
                Alert.alert('Error', data.error || 'Failed to add comment');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add comment');
        }
    };

    const handleRunCode = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/run_code/question/${post.id}/`, {
                method: 'POST', // Use POST instead of GET
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Add any required data here if necessary
            });
    
            const data = await response.json();
    
            if (response.status === 200) {
                setCodeOutput(data.output);
            } else {
                Alert.alert('Error', data.error || 'Failed to run code');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to run code');
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

            {/* Code Snippet Section */}
            {post.codeSnippet ? (
                <View style={styles.codeContainer}>
                    <Text style={styles.codeTitle}>Code Snippet:</Text>
                    <CustomSyntaxHighlighter language={post.programmingLanguage || 'javascript'}>
                        {post.codeSnippet}
                    </CustomSyntaxHighlighter>
                </View>
            ) : null}

            {/* Run Code Button */}
            <TouchableOpacity style={styles.runButton} onPress={handleRunCode}>
                <Text style={styles.runButtonText}>Run Code</Text>
            </TouchableOpacity>

            {/* Code Output */}
            {codeOutput ? (
                <View style={styles.outputContainer}>
                    <Text style={styles.outputTitle}>Output:</Text>
                    <Text>{String(codeOutput)}</Text>
                </View>
            ) : null}

            {/* Comments Section */}
            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Comments:</Text>
                {comments.map((comment, index) => (
                    <View key={index} style={styles.comment}>
                        <Text style={styles.commentUser}>{comment.user}:</Text>
                        <Text style={styles.commentText}>{comment.details}</Text>
                        {comment.code_snippet ? (
                            <CustomSyntaxHighlighter language={comment.language || 'javascript'}>
                                {comment.code_snippet}
                            </CustomSyntaxHighlighter>
                        ) : null}
                    </View>
                ))}
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

            {/* Add Comment Inputs */}
            <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
            />
            <TextInput
                style={styles.codeInput}
                placeholder="Add a code snippet..."
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline={true}
            />

            {/* Submit Comment Button */}
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
    codeContainer: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    codeTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
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
    codeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        fontFamily: 'monospace',
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

export default QuestionDetail;
