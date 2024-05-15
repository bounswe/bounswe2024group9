import React, {useState} from "react";
import { StyleSheet, Text, View, Button, Modal, TextInput, SafeAreaView } from "react-native";
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from "react-native-maps";
import RNPickerSelect from "react-native-picker-select";

const CreateRoute = ({navigation}) => {

    const [currentPoi, setCurrentPoi] = useState(null);
    const [route, setRoute] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [routeTitle, setRouteTitle] = useState('');
    const [routeDescription, setRouteDescription] = useState('')


    const addPOI = () => {
        const newRoute = route.concat(currentPoi);
        setRoute(newRoute);
        console.log(route);
    }

    const removePOI = (elt) => {
        const newRoute = route.filter((item) => item.placeID != elt.id);
        setRoute(newRoute);
    }

    const handlePoiClick = (e: any) => {
        const poi = e.nativeEvent;
        setCurrentPoi(poi);
    }

    const getWikidataItem = (gMapsItem) => {
        const name = gMapsItem.name;
        const latitude = gMapsItem.coordinate.latitude;
        const longitude = gMapsItem.coordinate.longitude;

        console.log('sending info: ' + name + latitude + longitude);
        // bu 3 info ile wikidata search yap, result i dondur (lat lon farki
        // en az olan dogrudur)
    }

    const saveRoute = () => {
        route.map((routeItem) => {
            getWikidataItem(routeItem);
            // donen itemi (eger donduyse) listeye ekle
            // yoksa hata ver
        });
    }

return (
    <SafeAreaView style={styles.container}>
      {/* First Box */}
      <View style={styles.box}>
        <TextInput style={styles.textInput} placeholder="Title"/>
        <TextInput style={styles.textInput} placeholder="Description" multiline={true}/>
        <TextInput style={styles.textInput} placeholder="Search"/>
        <View style={styles.buttonsContainer}>
          <Button title="Button 1" onPress={() => {}} />
          <Button title="Button 2" onPress={() => {}} />
          <Button title="Button 3" onPress={() => {}} />
          <Button title="Button 4" onPress={() => {}} />
          <Button title="Button 5" onPress={() => {}} />
        </View>
      </View>

      {/* separator */}
      <View
        style={styles.separator}
      />
      {/* Second Box */}
      <View style={styles.box}>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
  },
  separator: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  box: {
    marginVertical: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'magenta',
    borderRadius: 8,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CreateRoute;

/*
return (
<View
    style={styles.map}>
    <TextInput
                placeholder="Enter Title"
                style={styles.titleField}
                value={routeTitle}
                onChangeText={setRouteTitle}
                />
    <TextInput
                    placeholder="Enter Description"
                    style={styles.descriptionField}
                    value={routeDescription}
                    onChangeText={setRouteDescription}
                    multiline={true}
                    />
    <MapView
      provider={PROVIDER_GOOGLE} // Specify Google Maps as the provider
      style={styles.map}
      minZoomLevel={0}
      maxZoomLevel={17}
      initialRegion={{
        latitude: 41.043150,
        longitude: 28.9637,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      onPress={() => {setCurrentPoi(null)}}
      onPoiClick={handlePoiClick}>
      {currentPoi && (
                        <Marker coordinate={currentPoi.coordinate}>
                          <Callout
                            onPress={addPOI}>
                            <View>
                              <Text>{currentPoi.name}</Text>

                              <Button
                                  title="Add">
                              </Button>
                            </View>
                          </Callout>
                        </Marker>
                      )}
    </MapView>
    <Button
        title="See Route"
        onPress={() => setShowModal(true)}>
    </Button>
    <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {setShowModal(false)}}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            {route.map((item) => (
                <View style={{justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgba(0, 0, 255, 0.5)', flexDirection: 'row-reverse'}}>
                <Text style={{color: 'yellow'}}>{item.name}    </Text>
                <Button
                    title="Remove"
                    onPress={(item) => {removePOI(item)}}>
                    </Button>
                </View>
            ))}
                    <Button title="Back to Selection" onPress={() => setShowModal(false)}/>
                    <Button title="Save Route" onPress={saveRoute}/>
        </View>
    </Modal>
</View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
  titleField: {
    backgroundColor: '#fcffc9',
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10
  },
  descriptionField: {
      backgroundColor: '#9fffef',
      borderColor: 'gray',
      borderRadius: 10,
      padding: 10
    },
});
*/