import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Linking,
} from 'react-native';

const WikiResultDetail = ({ route }) => {
    const { user_id, wikiDetails } = route.params;

    const mainInfo = wikiDetails.mainInfo.length > 0 ? wikiDetails.mainInfo[0] : null;
    const instances = wikiDetails.instances || [];
    const wikipedia = wikiDetails.wikipedia || {};
    const [annotations, setAnnotations] = useState([]);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [startIndex, setStartIndex] = useState(null);
    const [endIndex, setEndIndex] = useState(null);
    const [annotationModalVisible, setAnnotationModalVisible] = useState(false);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [annotationText, setAnnotationText] = useState('');
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchAnnotations();
    }, []);

    const fetchAnnotations = async () => {
        try {
            const languageId = mainInfo.language.value.split('/').pop().replace('Q', '');
            const response = await fetch(`http://10.0.2.2:8000/get_annotations_by_language_id/${languageId}/`);
            const data = await response.json();
    
            if (response.ok) {
                setAnnotations(data.data || []);
            } else {
                Alert.alert('Error', data.error || 'Failed to fetch annotations.');
            }
        } catch (error) {
            console.error('Error fetching annotations:', error);
            Alert.alert('Error', 'Failed to fetch annotations.');
        }
    };
    

    const fetchRepliesForAnnotation = async (annotationId) => {
        try {
            const response = await fetch(`http://10.0.2.2:8000/get_replies/${annotationId}/`);
            const data = await response.json();
    
            if (response.ok) {
                return data.replies || [];
            } else {
                Alert.alert('Error', data.error || 'Failed to fetch replies.');
                return [];
            }
        } catch (error) {
            console.error('Error fetching replies:', error);
            Alert.alert('Error', 'Failed to fetch replies.');
            return [];
        }
    };

    
    const handleWordPress = (index) => {
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
        if (startIndex === null || endIndex === null || !annotationText.trim()) {
            Alert.alert('Error', 'Please select text and add annotation text.');
            return;
        }

        const selectedText = wikipedia.info
            .split(' ')
            .slice(startIndex, endIndex + 1)
            .join(' ');

        try {
            const annotationData = {
                text: annotationText,
                language_qid: mainInfo.language.value.split('/').pop().replace('Q', ''),
                annotation_starting_point: startIndex,
                annotation_ending_point: endIndex,
                type: 'annotation',
            };

            const response = await fetch('http://10.0.2.2:8000/create_annotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id
                },
                body: JSON.stringify(annotationData),
            });
            fetchAnnotations();
            if (response.status === 201) {
                Alert.alert('Success', 'Annotation added successfully');
                setAnnotations([
                    ...annotations,
                    { startIndex, endIndex, text: annotationText },
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

    const handleReplyToAnnotation = async (parentId) => {
        if (!replyText.trim()) {
            Alert.alert('Error', 'Reply cannot be empty.');
            return;
        }
    
        try {
            const replyData = {
                parent_id: parentId,
                text: replyText,
                language_qid: mainInfo.language.value.split('/').pop().replace('Q', ''),
                type: 'annotation_child',
            };
    
            const response = await fetch('http://10.0.2.2:8000/create_annotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id,
                },
                body: JSON.stringify(replyData),
            });
    
            if (response.status === 201) {
                Alert.alert('Success', 'Reply added successfully');
                setReplyModalVisible(false);
                setReplyText('');
                fetchAnnotations(); // Refresh annotations
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to add reply');
            }
        } catch (error) {
            console.error('Error replying to annotation:', error);
            Alert.alert('Error', 'Failed to reply to annotation');
        }
    };
    

    const renderAnnotatedText = (text) => {
        if (!text) {
            return <Text style={styles.wikiInfo}>No information available</Text>;
        }
    
        const words = text.split(' ');
        return (
            <Text style={styles.wikiInfo}>
                {words.map((word, index) => (
                    <Text key={index} onPress={() => handleWordPress(index)}>
                        <Text
                            style={[
                                styles.textWord,
                                index >= startIndex &&
                                    index <= endIndex &&
                                    styles.selectedWord,
                                annotations.some(
                                    (annotation) =>
                                        index >= annotation.annotation_starting_point &&
                                        index <= annotation.annotation_ending_point
                                ) && styles.annotatedWord,
                            ]}
                        >
                            {word}
                        </Text>{' '}
                    </Text>
                ))}
            </Text>
        );
    };
    

    const deleteAnnotation = async (annotationId) => {
        console.log(user_id);
        try {
            const response = await fetch(`http://10.0.2.2:8000/delete_annotation/${annotationId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Annotation deleted successfully.');
                setReplyModalVisible(false);
                fetchAnnotations();
            } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete annotation.');
            }
        } catch (error) {
            console.error('Error deleting annotation:', error);
            Alert.alert('Error', 'Failed to delete annotation.');
        }
    };

    return (
<ScrollView style={styles.container}>
    {/* Main Information Section */}
    {mainInfo && (
        <View style={styles.section}>
            <Text style={styles.title}>{mainInfo.languageLabel.value}</Text>

            {mainInfo.wikipediaLink && (
                <Text
                    style={styles.link}
                    onPress={() => Linking.openURL(mainInfo.wikipediaLink.value)}
                >
                    Wikipedia: {mainInfo.wikipediaLink.value}
                </Text>
            )}
        </View>
    )}

    {/* Wikipedia Information */}
    {wikipedia.title && (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wikipedia Summary:</Text>
            <Text style={styles.wikiTitle}>{wikipedia.title}</Text>
            {renderAnnotatedText(wikipedia.info)}
        </View>
    )}

    {/* Annotation Modal */}
    <Modal visible={annotationModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Annotation</Text>

                {/* Display the selected text */}
                {startIndex !== null && endIndex !== null && (
                    <Text style={styles.modalSelectedText}>
                        "{wikipedia.info.split(' ').slice(startIndex, endIndex + 1).join(' ')}"
                    </Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Enter annotation text..."
                    value={annotationText}
                    onChangeText={setAnnotationText}
                />

                <View style={styles.modalButtonsContainer}>
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
        </View>
    </Modal>

    <Modal visible={replyModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Annotation Details</Text>

                {/* Display the selected annotation text */}
                {selectedAnnotation && (
                    <Text style={styles.modalSelectedText}>
                        "{wikipedia.info
                            .split(' ')
                            .slice(
                                selectedAnnotation.annotation_starting_point,
                                selectedAnnotation.annotation_ending_point + 1
                            )
                            .join(' ')}"
                    </Text>
                )}

                <Text style={styles.selectedText}>{selectedAnnotation?.text}</Text>

                {/* Replies Section */}
                <Text style={styles.replySectionTitle}>Replies:</Text>
                <ScrollView style={styles.repliesContainer}>
                    {selectedAnnotation?.child_annotations?.length > 0 ? (
                        selectedAnnotation.child_annotations.map((reply, index) => (
                            <View key={index} style={styles.replyItem}>
                                <Text style={styles.replyText}>{reply.text}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noRepliesText}>No replies yet.</Text>
                    )}
                </ScrollView>

                {/* Reply Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Reply to this annotation..."
                    value={replyText}
                    onChangeText={setReplyText}
                />

                <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleReplyToAnnotation(selectedAnnotation?.annotation_id)}
                    >
                        <Text style={styles.addButtonText}>Reply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setReplyModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>



</ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    wikiTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    wikiInfo: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
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
        paddingVertical: 10,
        paddingHorizontal: 20,

        marginTop: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#FF4500',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,

        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FF0000',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,

        marginTop: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    replySectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    repliesContainer: {
        maxHeight: 150,
        width: '100%',
        marginBottom: 15,
    },
    replyItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    replyText: {
        fontSize: 14,
        color: '#333',
    },
    noRepliesText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    
    
});

export default WikiResultDetail;
