import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';

const DiscussionDetail = ({ route }) => {
    const { post, user_id } = route.params;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [annotations, setAnnotations] = useState([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [startIndex, setStartIndex] = useState(null);
    const [endIndex, setEndIndex] = useState(null);
    const [annotationModalVisible, setAnnotationModalVisible] = useState(false);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [annotationText, setAnnotationText] = useState('');
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchComments();
        fetchAnnotations();
    }, [post.id]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/question/${post.id}/comments/`);
            const data = await response.json();

            if (response.status === 200) {
                setComments(data.comments);
            } else {
                Alert.alert('Error', data.error || 'Failed to fetch comments.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch comments.');
        }
    };

    const fetchAnnotations = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/get_annotations/question/${post.id}/`);
            const data = await response.json();

            if (response.ok) {
                setAnnotations(data.data || []);
            } else {
                Alert.alert('Error', 'Failed to fetch annotations.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch annotations.');
        }
    };

    const handleTextPress = (index) => {
        const clickedAnnotation = annotations.find(
            (annotation) =>
                index >= annotation.annotation_starting_point &&
                index <= annotation.annotation_ending_point
        );

        if (clickedAnnotation) {
            setSelectedAnnotation(clickedAnnotation);
            setReplyModalVisible(true);
        } else {
            if (startIndex === null) {
                setStartIndex(index);
                setEndIndex(index);
            } else if (index < startIndex) {
                setStartIndex(index);
            } else {
                setEndIndex(index);
                setAnnotationModalVisible(true);
            }
        }
    };

    const handleAddAnnotation = async () => {
        if (!annotationText.trim()) {
            Alert.alert('Error', 'Annotation text cannot be empty.');
            return;
        }

        const annotationData = {
            text: annotationText,
            annotation_type: 'question',
            language_qid: post.id,
            annotation_starting_point: startIndex,
            annotation_ending_point: endIndex,
            type: 'annotation',
        };

        try {
            const response = await fetch('http://10.0.2.2:8000/create_annotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(annotationData),
            });

            if (response.status === 201) {
                fetchAnnotations();
                setAnnotationModalVisible(false);
                setStartIndex(null);
                setEndIndex(null);
                setAnnotationText('');
            } else {
                Alert.alert('Error', 'Failed to add annotation.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add annotation.');
        }
    };

    const handleReplyToAnnotation = async (parentId) => {
        if (!replyText.trim()) {
            Alert.alert('Error', 'Reply cannot be empty.');
            return;
        }

        const replyData = {
            parent_id: parentId,
            text: replyText,
            annotation_type: 'question',
            language_qid: post.id,
            type: 'annotation_child',
        };

        try {
            const response = await fetch('http://10.0.2.2:8000/create_annotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(replyData),
            });

            if (response.status === 201) {
                fetchAnnotations();
                setReplyModalVisible(false);
                setReplyText('');
            } else {
                Alert.alert('Error', 'Failed to reply.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to reply.');
        }
    };

    const handleDeleteAnnotation = async (annotationId) => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/delete_annotation/${annotationId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
            });

            if (response.ok) {
                fetchAnnotations();
                setReplyModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to delete annotation.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to delete annotation.');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }

        const commentData = {
            details: newComment,
        };

        try {
            const response = await fetch(`http://10.0.2.2:8000/create_comment/${post.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(commentData),
            });

            if (response.status === 201) {
                fetchComments();
                setNewComment('');
            } else {
                Alert.alert('Error', 'Failed to add comment.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add comment.');
        }
    };

    const renderAnnotatedDescription = () => {
        return (
            <Text style={styles.description}>
                {post.description.split('').map((char, index) => (
                    <Text
                        key={index}
                        onPress={() => handleTextPress(index)}
                        style={[
                            styles.textChar,
                            index >= startIndex &&
                                index <= endIndex &&
                                styles.selectedChar,
                            annotations.some(
                                (a) =>
                                    index >= a.annotation_starting_point &&
                                    index <= a.annotation_ending_point
                            ) && styles.annotatedChar,
                        ]}
                    >
                        {char}
                    </Text>
                ))}
            </Text>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{post.title}</Text>
            {renderAnnotatedDescription()}

            {/* Comments Section */}
            <View style={styles.commentsContainer}>
                <Text style={styles.commentHeader}>Comments:</Text>
                {comments.map((comment, index) => (
                    <View key={index} style={styles.comment}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentText}>{comment.details}</Text>
                    </View>
                ))}

                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddComment}>
                    <Text style={styles.addButtonText}>Submit Comment</Text>
                </TouchableOpacity>
            </View>

            {/* Annotation Modal */}
            <Modal visible={annotationModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Show Original Selected Text */}
                        {startIndex !== null && endIndex !== null && (
                            <Text style={styles.modalSelectedText}>
                               {post.description.slice(startIndex, endIndex + 1)}
                            </Text>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Enter annotation content..."
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

            {/* Reply Modal */}
            <Modal visible={replyModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedAnnotation && (
                            <>
                                {/* Display Annotated Text with Author */}
                                <Text style={styles.modalSelectedText}>
                                    {post.description.slice(
                                        selectedAnnotation.annotation_starting_point,
                                        selectedAnnotation.annotation_ending_point + 1
                                    )}{' '}
                                    <Text style={styles.authorName}>by {selectedAnnotation.author_name}</Text>
                                </Text>

                                {/* Display Annotation Content */}
                                <Text style={styles.modalAnnotationContent}>
                                    {selectedAnnotation.text}
                                </Text>

                                {/* Display All Replies */}
                                <View style={styles.repliesContainer}>
                                    <Text style={styles.replyHeader}>Replies:</Text>
                                    {selectedAnnotation.child_annotations &&
                                    selectedAnnotation.child_annotations.length > 0 ? (
                                        selectedAnnotation.child_annotations.map((reply, index) => (
                                            <View key={index} style={styles.replyItemRow}>
                                                <Text style={styles.replyAuthor}>{reply.author_name}:</Text>
                                                <Text style={styles.replyText}> {reply.text}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noRepliesText}>No replies yet.</Text>
                                    )}
                                </View>

                                {/* Input for Adding Reply */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Reply to this annotation..."
                                    value={replyText}
                                    onChangeText={setReplyText}
                                />
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() =>
                                        handleReplyToAnnotation(selectedAnnotation?.annotation_id)
                                    }
                                >
                                    <Text style={styles.addButtonText}>Reply</Text>
                                </TouchableOpacity>

                                {/* Delete Annotation Button */}
                                {selectedAnnotation && selectedAnnotation.author_id === user_id && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() =>
                                            handleDeleteAnnotation(selectedAnnotation.annotation_id)
                                        }
                                    >
                                        <Text style={styles.deleteButtonText}>Delete Annotation</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setReplyModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
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
        lineHeight: 24,
        color: '#333',
    },
    textChar: {
        fontSize: 16,
    },
    selectedChar: {
        backgroundColor: 'yellow',
    },
    annotatedChar: {
        backgroundColor: '#FFD700',
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
        marginVertical: 10,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#00BFFF',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#FF4500',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalSelectedText: {
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    repliesContainer: {
        marginVertical: 10,
    },
    replyHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    replyItem: {
        marginBottom: 5,
    },
    replyAuthor: {
        fontWeight: 'bold',
    },
    replyText: {
        fontSize: 14,
        color: '#555',
    },
    noRepliesText: {
        fontSize: 14,
        color: '#888',
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    replyItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    authorName: {
        fontStyle: 'italic',
        color: '#555',
    },    
});

export default DiscussionDetail;
