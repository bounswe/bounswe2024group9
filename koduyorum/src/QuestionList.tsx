import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import QuestionCard from './QuestionCard';
import { useNavigation, useRoute } from '@react-navigation/native';

const QuestionList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { username, user_id } = route.params;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('title');
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [wikiSearchResults, setWikiSearchResults] = useState([]); // For Wiki API results

    // Fetch questions from the backend
    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://10.0.2.2:8000/random_questions/');
            const data = await response.json();
            setFilteredQuestions(data.questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Function to handle search
    const handleSearch = async () => {
        if (searchQuery.trim() === '') {
            fetchQuestions();
        } else {
            if (searchField === 'programmingLanguage') {
                try {
                    const response = await fetch(`http://10.0.2.2:8000/search/${encodeURIComponent(searchQuery)}`);
                    const data = await response.json();
                    setWikiSearchResults(data.results.bindings);
                    setFilteredQuestions([]);
                } catch (error) {
                    console.error('Error fetching wiki data', error);
                }
            } else {
                const filtered = filteredQuestions.filter((question) =>
                    question.topic.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredQuestions(filtered);
                setWikiSearchResults([]);
            }
        }
    };

    const handlePress = (post) => {
        navigation.navigate('PostDetail', { post, user_id, username });
    };

    const handleWikiResultPress = async (wikiUrl) => {
        const qid = wikiUrl.split('/').pop();
    
        try {
            const response = await fetch(`http://10.0.2.2:8000/result/${qid}`);
            const data = await response.json();
    
            navigation.navigate('WikiResultDetail', { wikiDetails: data });
        } catch (error) {
            console.error('Error fetching wiki result data:', error);
        }
    };
    
    const renderWikiResult = ({ item }) => (
        <TouchableOpacity style={styles.wikiResultItem} onPress={() => handleWikiResultPress(item.language.value)}>
            <Text style={styles.wikiResultText}>{item.languageLabel.value}</Text>
        </TouchableOpacity>
    );
    
    

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
                <Button title="Search" onPress={handleSearch} />
            </View>

            {/* Search Filter by Field */}
            <View style={styles.searchFilterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, searchField === 'title' && styles.activeFilterButton]}
                    onPress={() => setSearchField('title')}
                >
                    <Text style={styles.filterText}>Title</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, searchField === 'programmingLanguage' && styles.activeFilterButton]}
                    onPress={() => setSearchField('programmingLanguage')}
                >
                    <Text style={styles.filterText}>Programming Language</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, searchField === 'topic' && styles.activeFilterButton]}
                    onPress={() => setSearchField('topic')}
                >
                    <Text style={styles.filterText}>Topic</Text>
                </TouchableOpacity>
            </View>

            {/* Display Wiki Search Results if searching by programmingLanguage */}
            {searchField === 'programmingLanguage' && wikiSearchResults.length > 0 ? (
                <FlatList
                    data={wikiSearchResults}
                    keyExtractor={(item) => item.language.value}
                    renderItem={renderWikiResult}
                    ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
                />
            ) : (
                <FlatList
                    data={filteredQuestions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <QuestionCard post={item} currentUser={user_id} onPress={() => handlePress(item)} />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No questions found</Text>}
                />
            )}

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('CreateQuestion', { username, user_id })}
            >
                <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        padding: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
        height: 40,
    },
    searchFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    activeFilterButton: {
        backgroundColor: '#00BFFF',
    },
    filterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontSize: 16,
    },
    wikiResultItem: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    wikiResultText: {
        fontSize: 16,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#00BFFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    plusText: {
        color: 'white',
        fontSize: 32,
    },
});

export default QuestionList;
