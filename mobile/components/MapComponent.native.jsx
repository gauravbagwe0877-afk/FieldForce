import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapComponent({ location, workers }) {
  if (!location) return null;

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <MapView 
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {workers.map((w, i) => (
          <Marker 
            key={w.id}
            coordinate={{
              latitude: location.latitude + (Math.random() * 0.04 - 0.02),
              longitude: location.longitude + (Math.random() * 0.04 - 0.02)
            }}
            title={w.name}
            description={w.status}
          />
        ))}
      </MapView>
    </View>
  );
}
