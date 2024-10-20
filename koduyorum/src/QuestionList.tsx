import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import QuestionCard from './QuestionCard';
import { useNavigation } from '@react-navigation/native';

const QuestionList = () => {
    const navigation = useNavigation();
    const currentUser = 1; // Mock current user ID

    // Mock data for questions
    const mockQuestions = [
        {
            post_id: 1,
            title: 'How to optimize React Native app performance?',
            description: 'I am working on a React Native app and facing performance issues...',
            user_id: 2,
            likes: 15,
            comments: 4,
            programmingLanguage: 'JavaScript',
            topic: 'Performance Optimization',
            answered: true,
            codeSnippet: `
                function optimizePerformance() {
                  const cache = new Map();
                
                  return function (key, computeFn) {
                    if (cache.has(key)) {
                      console.log('Returning from cache:', key);
                      return cache.get(key);
                    } else {
                      const result = computeFn();
                      cache.set(key, result);
                      console.log('Computed and cached:', key);
                      return result;
                    }
                  };
                }
                
                const memoizedCompute = optimizePerformance();
                memoizedCompute('expensiveOperation', () => {
                  return 'heavy computation result';
                });
            `,
            mockComments: [
                { comment_id: 1, text: 'Try using the memoization technique!', user: 'user123' },
                { comment_id: 2, text: 'Look into the VirtualizedLists.', user: 'devGuy' },
            ],
        },
        {
            post_id: 2,
            title: 'Best practices for state management in Flutter?',
            description: 'What are the best state management practices in Flutter...',
            user_id: 3,
            likes: 8,
            comments: 2,
            programmingLanguage: 'Dart',
            topic: 'State Management',
            answered: false,
            codeSnippet: `
                class MyAppState extends State<MyApp> {
                  int _counter = 0;
                
                  void _incrementCounter() {
                    setState(() {
                      _counter++;
                    });
                  }
                
                  @override
                  Widget build(BuildContext context) {
                    return Scaffold(
                      appBar: AppBar(
                        title: Text('Flutter Counter App'),
                      ),
                      body: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            Text('You have pushed the button this many times:'),
                            Text(
                              '$_counter',
                              style: Theme.of(context).textTheme.headline4,
                            ),
                          ],
                        ),
                      ),
                      floatingActionButton: FloatingActionButton(
                        onPressed: _incrementCounter,
                        tooltip: 'Increment',
                        child: Icon(Icons.add),
                      ),
                    );
                  }
                }
            `,
            mockComments: [
                { comment_id: 1, text: 'Use the Provider package!', user: 'flutterDev' },
            ],
        },
        {
            post_id: 3,
            title: 'How to implement machine learning models in Python?',
            description: 'I am trying to implement a machine learning model in Python...',
            user_id: 4,
            likes: 23,
            comments: 6,
            programmingLanguage: 'Python',
            topic: 'Machine Learning',
            answered: true,
            codeSnippet: `
                import numpy as np
                from sklearn.model_selection import train_test_split
                from sklearn.linear_model import LinearRegression
                
                # Generating some data
                X = np.random.rand(100, 1) * 10
                y = 2.5 * X + np.random.randn(100, 1) * 2
                
                # Splitting the data
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
                
                # Fitting a linear regression model
                model = LinearRegression()
                model.fit(X_train, y_train)
                
                # Predicting and calculating error
                y_pred = model.predict(X_test);
                error = np.mean((y_pred - y_test) ** 2);
                print(f'Mean squared error: {error}')
            `,
            mockComments: [
                { comment_id: 1, text: 'You can use scikit-learn for this!', user: 'ml_guru' },
                { comment_id: 2, text: 'Make sure to scale your data.', user: 'dataWizard' },
            ],
        },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState('title'); 
    const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions);

    // Function to handle search
    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setFilteredQuestions(mockQuestions);
        } else {
            const filtered = mockQuestions.filter((question) => {
                if (searchField === 'programmingLanguage') {
                    return question.programmingLanguage.toLowerCase().includes(searchQuery.toLowerCase());
                } else if (searchField === 'topic') {
                    return question.topic.toLowerCase().includes(searchQuery.toLowerCase());
                } else {
                    return (
                        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        question.description.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }
            });
            setFilteredQuestions(filtered);
        }
    };

    const handlePress = (post) => {
        navigation.navigate('PostDetail', { post, currentUser });
    };

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
                    style={[
                        styles.filterButton,
                        searchField === 'title' && styles.activeFilterButton,
                    ]}
                    onPress={() => setSearchField('title')}
                >
                    <Text style={styles.filterText}>Title</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        searchField === 'programmingLanguage' && styles.activeFilterButton,
                    ]}
                    onPress={() => setSearchField('programmingLanguage')}
                >
                    <Text style={styles.filterText}>Programming Language</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        searchField === 'topic' && styles.activeFilterButton,
                    ]}
                    onPress={() => setSearchField('topic')}
                >
                    <Text style={styles.filterText}>Topic</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredQuestions}
                keyExtractor={(item) => item.post_id.toString()}
                renderItem={({ item }) => (
                    <QuestionCard post={item} currentUser={currentUser} onPress={handlePress} />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No questions found</Text>}
            />
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
});

export default QuestionList;
