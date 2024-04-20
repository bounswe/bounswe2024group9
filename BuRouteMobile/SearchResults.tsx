import { WikidataSearch } from './App.tsx'

const DisplayResults = () => {

    return (
    <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>"Successfully changed page"</Text>
          <Button title="Return" onPress={WikidataSearch} />
        </View>
    );
};

export default DisplayResults;