import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';

const WikiResultDetail = ({ route }) => {
    const { wikiDetails } = route.params;

    const mainInfo = wikiDetails.mainInfo.length > 0 ? wikiDetails.mainInfo[0] : null;

    return (
        <ScrollView style={styles.container}>
            {mainInfo && (
                <View>
                    <Text style={styles.title}>{mainInfo.languageLabel.value}</Text>
                    
                    {mainInfo.wikipediaLink && (
                        <Text
                            style={styles.link}
                            onPress={() => Linking.openURL(mainInfo.wikipediaLink.value)}
                        >
                            Wikipedia: {mainInfo.wikipediaLink.value}
                        </Text>
                    )}
                    
                    {mainInfo.influencedByLabel && (
                        <Text style={styles.detail}>
                            Influenced By: {mainInfo.influencedByLabel.value}
                        </Text>
                    )}

                    {mainInfo.publicationDate && (
                        <Text style={styles.detail}>
                            Publication Date: {mainInfo.publicationDate.value}
                        </Text>
                    )}

                    {mainInfo.inceptionDate && (
                        <Text style={styles.detail}>
                            Inception Date: {mainInfo.inceptionDate.value}
                        </Text>
                    )}

                    {mainInfo.website && (
                        <Text
                            style={styles.link}
                            onPress={() => Linking.openURL(mainInfo.website.value)}
                        >
                            Official Website: {mainInfo.website.value}
                        </Text>
                    )}
                </View>
            )}

            {wikiDetails.instances.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Related Instances:</Text>
                    {wikiDetails.instances.map((instance, index) => (
                        <View key={index} style={styles.instanceContainer}>
                            <Text style={styles.instanceLabel}>
                                {instance.instanceLabel}:
                            </Text>
                            <Text>
                                {instance.relatedLanguages.map(
                                    (lang) => lang.relatedLanguageLabel
                                ).join(', ')}
                            </Text>
                        </View>
                    ))}
                </View>
            )}


            {wikiDetails.wikipedia && wikiDetails.wikipedia.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Additional Wikipedia Data:</Text>
                    {wikiDetails.wikipedia.map((data, index) => (
                        <Text key={index} style={styles.detail}>
                            {data}
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    link: {
        color: 'blue',
        marginBottom: 10,
    },
    detail: {
        fontSize: 16,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    instanceContainer: {
        marginBottom: 10,
    },
    instanceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WikiResultDetail;
