import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const PostDetail = ({ route }) => {
    const { post, user_id, username } = route.params;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [codeSnippetState, setCodeSnippetState] = useState(post.codeSnippet || '');
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [annotations, setAnnotations] = useState([]);
    const [startIndex, setStartIndex] = useState(null);
    const [endIndex, setEndIndex] = useState(null);
    const [annotationModalVisible, setAnnotationModalVisible] = useState(false);
    const [annotationText, setAnnotationText] = useState('');
    const [selectedAnnotationTarget, setSelectedAnnotationTarget] = useState(null);

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
    
    const handleWordPress = (index, target) => {
        setSelectedAnnotationTarget(target);
        if (startIndex === null) {
            setStartIndex(index);
            setEndIndex(index);
        } else if (index < startIndex) {
            setStartIndex(index);
        } else {
            setEndIndex(index);
            setAnnotationModalVisible(true);
        }
    };
    

    const handleAddAnnotation = async () => {
        if (startIndex === null || endIndex === null || !annotationText.trim()) {
            Alert.alert('Error', 'Please select text and add annotation text.');
            return;
        }
    
        const selectedText =
            selectedAnnotationTarget === 'description'
                ? (post.description || '').split(' ').slice(startIndex, endIndex + 1).join(' ')
                : selectedAnnotationTarget === 'codeSnippet'
                ? (codeSnippetState || '').split(' ').slice(startIndex, endIndex + 1).join(' ')
                : (comments[selectedAnnotationTarget]?.details || '')
                      .split(' ')
                      .slice(startIndex, endIndex + 1)
                      .join(' ');
    
        try {
            const annotationData = {
                text: annotationText,
                target: selectedAnnotationTarget,
                language_qid: post.language_id,
                annotation_starting_point: selectedText,
                annotation_ending_point: selectedText,
                type: 'annotation',
            };
    
            const response = await fetch('http://10.0.2.2:8000/create_annotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(annotationData),
            });
    
            if (response.status === 201) {
                Alert.alert('Success', 'Annotation added successfully');
                setAnnotations([
                    ...annotations,
                    { startIndex, endIndex, text: annotationText, target: selectedAnnotationTarget },
                ]);
                setAnnotationModalVisible(false);
                setAnnotationText('');
                setStartIndex(null);
                setEndIndex(null);
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to add annotation');
            }
        } catch (error) {
            console.error('Error adding annotation:', error);
            Alert.alert('Error', 'Failed to add annotation');
        }
    };
    
    const renderAnnotatedText = (text, target) => {
        if (!text) {
            return <Text style={styles.description}>No text available</Text>;
        }
    
        const words = text.split(' '); // Safe to call `split` since `text` is validated
        return (
            <Text style={styles.description}>
                {words.map((word, index) => (
                    <Text key={index} onPress={() => handleWordPress(index, target)}>
                        <Text
                            style={[
                                styles.textWord,
                                index >= startIndex &&
                                    index <= endIndex &&
                                    selectedAnnotationTarget === target &&
                                    styles.selectedWord,
                                annotations.some(
                                    (annotation) =>
                                        index >= annotation.startIndex &&
                                        index <= annotation.endIndex &&
                                        annotation.target === target
                                ) && styles.annotatedWord,
                            ]}
                        >
                            {word}
                        </Text>
                        <Text> </Text>
                    </Text>
                ))}
            </Text>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
    
            {/* Render Annotated Description */}
            {renderAnnotatedText(post.description, 'description')}
    
            <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Code Snippet:</Text>
                <SyntaxHighlighter
                    language={post.programmingLanguage}
                    style={atomOneDark}
                >
                    {(codeSnippetState || '')
                        .split(' ')
                        .map((word, index) => {
                            // Check if this word is part of an annotation
                            const isAnnotated = annotations.some(
                                (annotation) =>
                                    index >= annotation.startIndex &&
                                    index <= annotation.endIndex &&
                                    annotation.target === 'codeSnippet'
                            );

                            // Highlight the selected word visually (optional)
                            if (
                                index >= startIndex &&
                                index <= endIndex &&
                                selectedAnnotationTarget === 'codeSnippet'
                            ) {
                                return `<span style="background-color: yellow">${word}</span>`;
                            }

                            // Italicize annotated words
                            if (isAnnotated) {
                                return `<i>${word}</i>`;
                            }

                            return word;
                        })
                        .join(' ')}
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
                {/* Render Annotated Comments */}
                {comments.map((comment, index) => (
                    <View key={index} style={styles.comment}>
                        <Text style={styles.commentUser}>{comment.user}:</Text>
                        {renderAnnotatedText(comment.details, `comment-${index}`)}
                        {comment.code_snippet ? (
                            <SyntaxHighlighter language={selectedLanguage || 'javascript'} style={atomOneDark}>
                                {comment.code_snippet}
                            </SyntaxHighlighter>
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
    
            {/* Annotation Modal */}
            <Modal visible={annotationModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Annotation</Text>
                        {/* Display the selected text */}
                        <Text style={styles.selectedText}>
                            {selectedAnnotationTarget === 'description' && post.description.split(' ').slice(startIndex, endIndex + 1).join(' ')}
                            {selectedAnnotationTarget === 'codeSnippet' && codeSnippetState.split(' ').slice(startIndex, endIndex + 1).join(' ')}
                            {selectedAnnotationTarget?.startsWith('comment-') && 
                                comments[parseInt(selectedAnnotationTarget.split('-')[1])].details
                                    .split(' ')
                                    .slice(startIndex, endIndex + 1)
                                    .join(' ')}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter annotation text..."
                            value={annotationText}
                            onChangeText={setAnnotationText}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddAnnotation}>
                            <Text style={styles.addButtonText}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setAnnotationModalVisible(false);
                                setStartIndex(null);
                                setEndIndex(null);
                                setAnnotationText('');
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
