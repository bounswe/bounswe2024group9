import React from 'react';
import { Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const CustomSyntaxHighlighter = ({ language = 'javascript', children }) => {
    // Validate language prop
    const validLanguage = typeof language === 'string' && language.trim() !== '' ? language : 'javascript';

    // Helper to add line numbers
    const addLineNumbers = (code) => {
        return code
            .split('\n')
            .map((line, idx) => `${idx + 1} ${line}`)
            .join('\n');
    };

    return (
        <ScrollView horizontal>
            <Text>
                <SyntaxHighlighter
                    language={validLanguage} // Use the validated language
                    style={atomOneDark}
                >
                    {addLineNumbers(children)}
                </SyntaxHighlighter>
            </Text>
        </ScrollView>
    );
};

export default CustomSyntaxHighlighter;
