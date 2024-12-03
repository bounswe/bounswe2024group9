import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const QuestionCard = ({ post, currentUser, onPress }) => {
    const navigation = useNavigation();

    const {
        id,
        title,
        description,
        user_id,
        likes: initialLikes,
        programmingLanguage,
        tags,
        answered,
        upvoted_by = [],
        downvoted_by = [],
    } = post;

    const [likes, setLikes] = useState(initialLikes);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasDownvoted, setHasDownvoted] = useState(false);

    useEffect(() => {
        setHasUpvoted(upvoted_by.includes(currentUser.username));
        setHasDownvoted(downvoted_by.includes(currentUser.username));
    }, [upvoted_by, downvoted_by, currentUser.username]);

    const handleVote = async (voteType) => {
        try {
            const endpoint = voteType === 'UPVOTE'
                ? `http://10.0.2.2:8000/upvote_object/question/${id}/`
                : `http://10.0.2.2:8000/downvote_object/question/${id}/`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': currentUser.id,
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (voteType === 'UPVOTE') {
                    setLikes((prevLikes) => prevLikes + (hasDownvoted ? 2 : 1));
                    setHasUpvoted(true);
                    setHasDownvoted(false);
                } else {
                    setLikes((prevLikes) => prevLikes - (hasUpvoted ? 2 : 1));
                    setHasDownvoted(true);
                    setHasUpvoted(false);
                }
            } else {
                console.error('Vote failed:', data.error);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleTagPress = (tag) => {
        navigation.navigate('LabelDetailsScreen', {
            user_id: currentUser.id,
            labelType: 'Tag',
            labelValue: tag,
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
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('LabelDetailsScreen', {
                            labelType: 'Programming Language',
                            labelValue: programmingLanguage,
                        })
                    }
                >
                    <Text style={styles.label}>{programmingLanguage}</Text>
                </TouchableOpacity>
                {tags.map((tag, index) => (
                    <TouchableOpacity key={index} onPress={() => handleTagPress(tag)}>
                        <Text style={styles.label}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.description}>{description}</Text>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.footerItem}
                    onPress={() => handleVote('UPVOTE')}
                >
                    <MaterialIcons
                        name="arrow-upward"
                        size={24}
                        color={hasUpvoted ? '#007bff' : '#888'}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.footerItem}
                    onPress={() => handleVote('DOWNVOTE')}
                >
                    <MaterialIcons
                        name="arrow-downward"
                        size={24}
                        color={hasDownvoted ? '#dc3545' : '#888'}
                    />
                </TouchableOpacity>
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
        flexWrap: 'wrap',
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
        marginBottom: 5,
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
    voteCount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
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
