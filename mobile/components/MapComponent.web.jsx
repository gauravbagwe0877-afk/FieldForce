import React from 'react';
import { View } from 'react-native';

export default function MapComponent({ location, workers }) {
  if (!location) return null;

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <iframe 
        title="Public Web Map"
        style={{ width: '100%', height: '100%', border: 'none' }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.05}%2C${location.latitude - 0.05}%2C${location.longitude + 0.05}%2C${location.latitude + 0.05}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
      />
    </View>
  );
}
