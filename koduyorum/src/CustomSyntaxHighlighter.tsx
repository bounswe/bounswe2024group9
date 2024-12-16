import React from 'react';
import { Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-native-syntax-highlighter';

const CustomSyntaxHighlighter = ({ language = 'javascript', children = '' }) => {
    const validLanguage = typeof language === 'string' && language.trim() !== '' ? language : 'javascript';

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
                    language={validLanguage}
                    style={atomOneDark}
                >
                    {addLineNumbers(children)}
                </SyntaxHighlighter>
            </Text>
        </ScrollView>
    );
};

export default CustomSyntaxHighlighter;
