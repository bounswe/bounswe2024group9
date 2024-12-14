import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';
import CustomSyntaxHighlighter from './CustomSyntaxHighlighter';

const PostDetail = ({ route }) => {
    const { post, user_id, username } = route.params;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [codeSnippetState, setCodeSnippetState] = useState(post.codeSnippet || '');
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

    useEffect(() => {
        const fetchCodeSnippetIfEmpty = async () => {
            if (!codeSnippet.trim()) {
                try {
                    const response = await fetch(`http://10.0.2.2:8000/get_code_snippet_if_empty/${post.id}/`);
                    const data = await response.json();
                    if (response.status === 200) {
                        setCodeSnippetState(data.codeSnippet);
                    } else {
                        Alert.alert('Error', data.error || 'Failed to fetch code snippet');
                    }
                } catch (error) {
                    console.error('Error fetching code snippet:', error);
                    Alert.alert('Error', 'Failed to fetch code snippet');
                }
            }
        };

        fetchCodeSnippetIfEmpty();
    }, [post.id, codeSnippet]);

    const handleAddComment = async () => {
        if (newComment.trim() === '' || selectedLanguage === '') {
            Alert.alert('Comment, language, and code snippet cannot be empty');
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
                setComments([
                    ...comments,
                    {
                        comment_id: data.comment_id,
                        details: newComment,
                        code_snippet: codeSnippet,
                        user: username,
                    },
                ]);
                setNewComment('');
                setCodeSnippet(''); 
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
            const response = await fetch(`http://10.0.2.2:8000/run_code/question/${post.id}/`);
            const data = await response.json();
    
            if (response.status === 200) {
                setCodeOutput(data.output); // Set the output in state
            } else {
                Alert.alert('Error', data.error || 'Failed to run code');
            }
        } catch (error) {
            console.error('Error running code:', error);
            Alert.alert('Error', 'Failed to run code');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Post Title */}
            <Text style={styles.title}>{post.title}</Text>
    
            {/* Post Description */}
            {post.description && (
                <Text style={styles.description}>{post.description}</Text>
            )}
    
            {/* Additional Metadata (Optional) */}
            {post.author && (
                <Text style={styles.metadata}>
                    Author: <Text style={styles.metadataValue}>{post.author}</Text>
                </Text>
            )}
            {post.date && (
                <Text style={styles.metadata}>
                    Posted on: <Text style={styles.metadataValue}>{post.date}</Text>
                </Text>
            )}
    
            {/* Code Snippet Section */}
            <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Code Snippet:</Text>
                <CustomSyntaxHighlighter
                    language={post.programmingLanguage || 'javascript'}
                >
                    {codeSnippetState || ''}
                </CustomSyntaxHighlighter>
            </View>
    
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
                            <CustomSyntaxHighlighter
                                language={comment.language || 'javascript'}
                            >
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
    textWord: {
        fontSize: 16,
    },
    selectedWord: {
        backgroundColor: 'yellow',
    },
    annotatedWord: {
        backgroundColor: '#FFD700',
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
    modalSelectedText: {
        marginBottom: 10,
        fontSize: 16,
        color: '#333',
        fontStyle: 'italic',
    },    
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#FF4500',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },    
});


export default PostDetail;
