import React, {useState} from "react";
import { StyleSheet, Text, View, Button, Modal } from "react-native";
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from "react-native-maps";

const CreateRoute = ({navigation}) => {

    const [currentPoi, setCurrentPoi] = useState(null);
    const [route, setRoute] = useState([]);
    const [showModal, setShowModal] = useState(false)

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

return (
<View
    style={styles.map}>
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
                    <Button title="Save Route" />
        </View>
    </Modal>
</View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1
  },
});

export default CreateRoute;