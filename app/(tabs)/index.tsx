import { Stack } from 'expo-router';
import {} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect } from 'react';

export default function Home() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadLocalAssets();
    }
  }, [permissionResponse]);

  const loadLocalAssets = async () => {
    const assetsPage = await MediaLibrary.getAssetsAsync();
    console.log(assetsPage);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
    </>
  );
}
