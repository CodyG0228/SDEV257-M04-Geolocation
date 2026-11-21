import React, { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import styles from "./styles";

StatusBar.setBarStyle("dark-content");

export default function App() {
  const [address, setAddress] = useState("loading...");
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();

  useEffect(() => {
    let watcher;

    async function setPosition({ coords }) {
      setLongitude(coords.longitude);
      setLatitude(coords.latitude);

      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setAddress(
          place
            ? [place.name, place.street, place.city, place.region]
                .filter(Boolean)
                .join(", ")
            : "Address unavailable"
        );
      } catch {
        setAddress("Address unavailable");
      }
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setPosition(location);

      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest },
        setPosition
      );
    })();

    return () => {
      watcher?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapView}
        showsPointsOfInterest={false}
        showsUserLocation
        followUserLocation
        initialRegion={{
          latitude: 39.105648,
          longitude: -87.408982,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
      >
        <Marker
          title="Target Location"
          description="39.105648, -87.408982"
          coordinate={{
            latitude: 39.105648,
            longitude: -87.408982,
          }}
        />
        <Marker
          title="La Pachanga"
          description="Great, local Mexican cuisine."
          coordinate={{
            latitude: 39.1057439,
            longitude: -87.4089927,
          }}
        />
      </MapView>
      <Text style={styles.label}>Address: {address}</Text>
      <Text style={styles.label}>Latitude: {latitude}</Text>
      <Text style={styles.label}>Longitude: {longitude}</Text>
    </View>
  );
}
