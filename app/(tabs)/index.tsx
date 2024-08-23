import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { FlatList, Text } from 'react-native';
import { Image } from 'expo-image';

export default function Home() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasEndCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);

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
    if (loading || !hasNextPage) return;
    setLoading(true);
    const assetsPage = await MediaLibrary.getAssetsAsync({
      after: hasEndCursor,
    });
    console.log(JSON.stringify(assetsPage.assets, null, 2));
    setLocalAssets((existingAssets) => [...existingAssets, ...assetsPage.assets]);
    setHasNextPage(assetsPage.hasNextPage);
    setEndCursor(assetsPage.endCursor);
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={localAssets}
        keyExtractor={(item) => item.id}
        numColumns={4}
        columnWrapperStyle={{ gap: 2 }}
        contentContainerStyle={{ gap: 2 }}
        onEndReached={loadLocalAssets}
        onEndReachedThreshold={2}
        refreshing={loading}
        renderItem={({ item }) => {
          return (
            <Image
              key={item.id}
              source={{ uri: item.uri }}
              style={{ width: '25%', aspectRatio: 1 }}
            />
          );
        }}
      />
      {hasNextPage && (
        <Text className="" onPress={loadLocalAssets}>
          Load More
        </Text>
      )}
    </>
  );
}
