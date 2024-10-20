import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const QuestionCard = ({ post, currentUser, onPress }) => {
    const {
        post_id,
        title,
        description,
        user_id,
        likes: initialLikes,
        comments: initialComments,
        programmingLanguage,
        topic,
        answered,
    } = post;

    const [likes, setLikes] = useState(initialLikes);
    const [comments, setComments] = useState(initialComments);

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
                <Text style={styles.label}>{programmingLanguage}</Text>
                <Text style={styles.label}>{topic}</Text>
            </View>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Icon name="thumbs-up-outline" size={14} color="#888" />
                    <Text style={styles.footerText}>{likes} Likes</Text>
                </View>
                <View style={styles.footerItem}>
                    <Icon name="chatbubble-outline" size={14} color="#888" />
                    <Text style={styles.footerText}>{comments} Comments</Text>
                </View>
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
        justifyContent: 'space-between',
        marginTop: 10,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
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
