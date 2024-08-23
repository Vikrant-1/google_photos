import { Stack } from 'expo-router';
import { FlatList, Text } from 'react-native';
import { Image } from 'expo-image';
import { useMedia } from '~/providers/MediaProvider';

export default function Home() {
  const { assets, loadLocalAssets, loading, hasNextPage } = useMedia();

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={assets}
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
    </>
  );
}
