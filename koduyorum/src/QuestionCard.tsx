import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const QuestionCard = ({ post, currentUser, onPress }) => {
    const {
        post_id,
        title,
        description,
        user_id,
        likes: initialLikes,
        programmingLanguage,
        answered,
    } = post;

    const [likes, setLikes] = useState(initialLikes);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasDownvoted, setHasDownvoted] = useState(false);

    const navigation = useNavigation();

    const handleUpvote = () => {
        if (hasUpvoted) {
            setLikes(likes - 1);
            setHasUpvoted(false);
        } else {
            setLikes(hasDownvoted ? likes + 2 : likes + 1);
            setHasUpvoted(true);
            setHasDownvoted(false);
        }
    };

    const handleDownvote = () => {
        if (hasDownvoted) {
            setLikes(likes + 1);
            setHasDownvoted(false);
        } else {
            setLikes(hasUpvoted ? likes - 2 : likes - 1);
            setHasDownvoted(true);
            setHasUpvoted(false);
        }
    };

    // Navigate to a new page when a label is clicked
    const handleLabelClick = (labelType, labelValue) => {
        navigation.navigate('LabelDetails', {
            labelType,
            labelValue,
        });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(post)}>
            {answered ? (
                <View style={styles.answeredLabel}>
                    <Text style={styles.answeredText}>Answered</Text>
                </View>
            ) : (
                <View style={styles.unansweredLabel}>
                    <Text style={styles.unansweredText}>Unanswered</Text>
                </View>
            )}

            <Text style={styles.title}>{title}</Text>

            <View style={styles.labelsContainer}>
                <TouchableOpacity onPress={() => handleLabelClick('Programming Language', programmingLanguage)}>
                    <Text style={styles.label}>{programmingLanguage}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerItem} onPress={handleUpvote}>
                    <MaterialIcons
                        name="arrow-upward"
                        size={24}
                        color={hasUpvoted ? '#007bff' : '#888'}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerItem} onPress={handleDownvote}>
                    <MaterialIcons
                        name="arrow-downward"
                        size={24}
                        color={hasDownvoted ? '#dc3545' : '#888'}
                    />
                </TouchableOpacity>
                <Text style={styles.footerText}>{likes} Likes</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        color: '#007bff',
        backgroundColor: '#e6f0ff',
        borderRadius: 12,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginRight: 5,
    },
    description: {
        fontSize: 13,
        color: '#555',
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    footerItem: {
        marginRight: 15,
    },
    footerText: {
        fontSize: 12,
        color: '#888',
    },
    answeredLabel: {
        position: 'absolute',
        top: -5,
        left: -5,
        backgroundColor: '#28a745',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    answeredText: {
        fontSize: 10,
        color: '#fff',
    },
    unansweredLabel: {
        position: 'absolute',
        top: -5,
        left: -5,
        backgroundColor: '#dc3545',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    unansweredText: {
        fontSize: 10,
        color: '#fff',
    },
});

export default QuestionCard;
