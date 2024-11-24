import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
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
    const [upvotes, setUpvotes] = useState(post.upvotes);
    const [isAnswered, setIsAnswered] = useState(post.answered);
    const [annotations, setAnnotations] = useState([]);
    const [textAnnotations, setTextAnnotations] = useState({});
    const [annotationModalVisible, setAnnotationModalVisible] = useState(false);
    const [annotationText, setAnnotationText] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [startIndex, setStartIndex] = useState(null);
    const [endIndex, setEndIndex] = useState(null);

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

        const fetchAnnotations = async () => {
            try {
                const response = await fetch(
                    `http://10.0.2.2:8000/get_annotations_by_language/${post.language_id}/`
                );
                const data = await response.json();
                if (response.status === 200) {
                    setAnnotations(data.data);
                    const textAnnotationMap = {};
                    data.data.forEach((annotation) => {
                        const targetText = annotation.annotation_starting_point;
                        if (!textAnnotationMap[targetText]) {
                            textAnnotationMap[targetText] = 1;
                        } else {
                            textAnnotationMap[targetText] += 1;
                        }
                    });
                    setTextAnnotations(textAnnotationMap);
                } else {
                    console.error('Error fetching annotations:', data.error);
                }
            } catch (error) {
                console.error('Error fetching annotations:', error);
            }
        };

        fetchComments();
        fetchAnnotations();
    }, [post.id, post.language_id]);

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

    const handleTextSelection = (text) => {
        setSelectedText(text);
        setAnnotationModalVisible(true);
    };

    const handleWordPress = (index) => {
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
        if (!selectedText || !annotationText) {
            Alert.alert('Error', 'Both selected text and annotation text are required.');
            return;
        }

        try {
            const annotationData = {
                text: annotationText,
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
                setAnnotationModalVisible(false);
                setAnnotationText('');

                const updatedTextAnnotations = { ...textAnnotations };
                if (!updatedTextAnnotations[selectedText]) {
                    updatedTextAnnotations[selectedText] = 1;
                } else {
                    updatedTextAnnotations[selectedText] += 1;
                }
                setTextAnnotations(updatedTextAnnotations);
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to add annotation');
            }
        } catch (error) {
            console.error('Error adding annotation:', error);
            Alert.alert('Error', 'Failed to add annotation');
        }
    };
    const handleAddAnnotationForSelection = async () => {
        if (startIndex === null || endIndex === null || !annotationText) {
            Alert.alert('Error', 'Please select text and add annotation text.');
            return;
        }
    
        const selectedWords = post.description.split(' ').slice(startIndex, endIndex + 1).join(' ');
        setSelectedText(selectedWords);
    
        try {
            const annotationData = {
                text: annotationText,
                language_qid: post.language_id,
                annotation_starting_point: selectedWords,
                annotation_ending_point: selectedWords,
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
                setAnnotationModalVisible(false);
                setAnnotationText('');
    
                const updatedTextAnnotations = { ...textAnnotations };
                if (!updatedTextAnnotations[selectedWords]) {
                    updatedTextAnnotations[selectedWords] = 1;
                } else {
                    updatedTextAnnotations[selectedWords] += 1;
                }
                setTextAnnotations(updatedTextAnnotations);
    
                // Reset selection
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
    

    const renderAnnotatedText = (text) => {
        const words = text.split(' ');
        return (
            <Text style={styles.descriptionText}>
                {words.map((word, index) => (
                    <Text key={index}>
                        <Pressable
                            onPress={() => handleWordPress(index)}
                            style={[
                                styles.wordContainer,
                                index >= startIndex && index <= endIndex && styles.selectedWord,
                            ]}
                        >
                            <Text style={styles.textWord}>
                                {word}
                                {textAnnotations[word] && (
                                    <Text style={styles.annotationCount}>
                                        [{textAnnotations[word]}]
                                    </Text>
                                )}
                            </Text>
                        </Pressable>
                        <Text>{' '}</Text> {/* Add a space between words */}
                    </Text>
                ))}
            </Text>
        );
    };
    
    

    const handleUpvote = async () => {
        try {
            const response = await fetch(
                `http://10.0.2.2:8000/upvote_object/question/${post.id}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-ID': user_id,
                    },
                }
            );

            if (response.ok) {
                setUpvotes(upvotes + 1);
                Alert.alert('Success', 'Question upvoted successfully');
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to upvote');
            }
        } catch (error) {
            console.error('Error upvoting:', error);
            Alert.alert('Error', 'Failed to upvote');
        }
    };

    const handleDownvote = async () => {
        try {
            const response = await fetch(
                `http://10.0.2.2:8000/downvote_object/question/${post.id}/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-ID': user_id,
                    },
                }
            );

            if (response.ok) {
                setUpvotes(upvotes - 1);
                Alert.alert('Success', 'Question downvoted successfully');
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to downvote');
            }
        } catch (error) {
            console.error('Error downvoting:', error);
            Alert.alert('Error', 'Failed to downvote');
        }
    };

    const renderComments = () => {
        return comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.user}:</Text>
                <Text style={styles.commentText}>{comment.details}</Text>

                {comment.code_snippet ? (
                    <SyntaxHighlighter language={selectedLanguage || 'javascript'} style={atomOneDark}>
                        {comment.code_snippet}
                    </SyntaxHighlighter>
                ) : null}
            </View>
        ));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.description}>{renderAnnotatedText(post.description)}</Text>

            <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Code Snippet:</Text>
                <SyntaxHighlighter language={post.programmingLanguage} style={atomOneDark}>
                    {post.codeSnippet}
                </SyntaxHighlighter>
            </View>

            <View style={styles.voteContainer}>
                <TouchableOpacity style={styles.voteButton} onPress={handleUpvote}>
                    <Text style={styles.voteButtonText}>Upvote ({upvotes})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.voteButton} onPress={handleDownvote}>
                    <Text style={styles.voteButtonText}>Downvote</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Comments:</Text>
                {renderComments()}
            </View>

            <Modal visible={annotationModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Annotation</Text>
                        <Text style={styles.modalSelectedText}>
                            {startIndex !== null && endIndex !== null
                                ? post.description.split(' ').slice(startIndex, endIndex + 1).join(' ')
                                : 'No text selected'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter annotation text..."
                            value={annotationText}
                            onChangeText={setAnnotationText}
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddAnnotationForSelection}
                        >
                            <Text style={styles.addButtonText}>Submit Annotation</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setAnnotationModalVisible(false);
                                setStartIndex(null);
                                setEndIndex(null);
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
    codeContainer: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
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
    modalSelectedText: {
        fontStyle: 'italic',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#32CD32',
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
    cancelButton: {
        backgroundColor: '#FF6347',
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
    textWord: {
        fontSize: 16,
    },
    annotationCount: {
        fontSize: 12,
        color: 'red',
    },
    annotatedWord: {
        marginVertical: 2,
    },
    textWord: {
        fontSize: 16,
    },
    annotationCount: {
        fontSize: 12,
        color: 'red',
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
    modalSelectedText: {
        fontStyle: 'italic',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#32CD32',
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
    cancelButton: {
        backgroundColor: '#FF6347',
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
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    wordContainer: {
        display: 'inline-flex',
    },
    textWord: {
        fontSize: 16,
    },
    selectedWord: {
        backgroundColor: 'yellow', // Highlight selected words
        borderRadius: 4,
    },
    annotationCount: {
        fontSize: 12,
        color: 'red',
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
    modalSelectedText: {
        fontStyle: 'italic',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#32CD32',
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
    cancelButton: {
        backgroundColor: '#FF6347',
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
