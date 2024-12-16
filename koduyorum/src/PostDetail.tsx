import React from 'react';
import { View, Text } from 'react-native';
import QuestionDetail from './QuestionDetail';
import DiscussionDetail from './DiscussionDetail';

const PostDetail = ({ route }) => {
    const { post, user_id, username } = route.params;

    console.log(post.post_type);
    if (post.post_type === 'question') {
        return <QuestionDetail route={route} />;
    } else if (post.post_type === 'discussion') {
        return <DiscussionDetail route={route} />;
    }

    return (
        <View style={{ padding: 20 }}>
            <Text>Unknown post type</Text>
        </View>
    );
};

export default PostDetail;
