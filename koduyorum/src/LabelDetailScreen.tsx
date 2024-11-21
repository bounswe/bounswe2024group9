import React from 'react';
import { View, Text } from 'react-native';

const LabelDetailsScreen = ({ route }) => {
    const { labelType, labelValue } = route.params;

    return (
        <View>
            <Text>{labelType}: {labelValue}</Text>
        </View>
    );
};

export default LabelDetailsScreen;
