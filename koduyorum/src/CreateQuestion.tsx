import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const CreateQuestion = ({ route, navigation }) => {
    const { username, user_id } = route.params;

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [postType, setPostType] = useState('question'); // Default to 'question'

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await fetch('http://10.0.2.2:8000/get_api_languages/');
                const data = await response.json();
                const languageNames = Object.keys(data.languages); // Extract language names from the dictionary
                setAvailableLanguages(languageNames);
            } catch (error) {
                Alert.alert('Error', 'Failed to load languages.');
            }
        };

        fetchLanguages();
    }, []);

    const handleSubmit = async () => {
        if (!title || !details || (postType === 'question' && !language)) {
            Alert.alert('All required fields must be filled!');
            return;
        }

        const postData = {
            title,
            language: postType === 'question' ? language : '', // Only include language for questions
            details,
            code_snippet: postType === 'question' ? codeSnippet : '', // Only include code snippet for questions
            tags: tags.split(',').map(tag => tag.trim()),
            post_type: postType,
        };

        try {
            const response = await fetch('http://10.0.2.2:8000/create_question/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': user_id.toString(),
                },
                body: JSON.stringify(postData),
            });

            const data = await response.json();

            if (response.status === 201) {
                Alert.alert('Success', 'Post created successfully');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.error || 'Failed to create post');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to create post');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create New Post</Text>

            <View style={styles.typePicker}>
                <Text style={styles.label}>Select Post Type:</Text>
                <Picker
                    selectedValue={postType}
                    onValueChange={(itemValue) => setPostType(itemValue)}
                >
                    <Picker.Item label="Question" value="question" />
                    <Picker.Item label="Discussion" value="discussion" />
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />

            {postType === 'question' && (
                <View style={styles.languagePicker}>
                    <Text style={styles.label}>Select Language:</Text>
                    <Picker
                        selectedValue={language}
                        onValueChange={(itemValue) => setLanguage(itemValue)}
                    >
                        {availableLanguages.map((lang, index) => (
                            <Picker.Item key={index} label={lang} value={lang} />
                        ))}
                    </Picker>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Details"
                value={details}
                onChangeText={setDetails}
                multiline
            />

            {postType === 'question' && (
                <View style={styles.codeContainer}>
                    <Text style={styles.codeTitle}>Code Snippet (optional):</Text>
                    <SyntaxHighlighter language={language.toLowerCase()} style={atomOneDark}>
                        {codeSnippet || 'Write your code here...'}
                    </SyntaxHighlighter>
                    <TextInput
                        style={styles.input}
                        placeholder="Add your code here"
                        value={codeSnippet}
                        onChangeText={setCodeSnippet}
                        multiline
                    />
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                value={tags}
                onChangeText={setTags}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                <Text style={styles.addButtonText}>Submit {postType === 'question' ? 'Question' : 'Discussion'}</Text>
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    typePicker: {
        marginBottom: 20,
    },
    languagePicker: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    codeContainer: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    codeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
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
});

export default CreateQuestion;
