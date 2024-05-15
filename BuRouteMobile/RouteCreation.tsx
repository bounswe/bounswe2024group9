import React, {useState} from "react";
import { StyleSheet, Text, View, Button, Modal, TextInput } from "react-native";
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from "react-native-maps";

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
                              {/* can add proper buttons here
                                    also conditional rendering
                               */}
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

export default CreateRoute;