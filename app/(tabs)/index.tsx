import { Link, Stack } from 'expo-router';
import { FlatList, Pressable, Text } from 'react-native';
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
            <Link href={`/asset?id=${item.id}`} asChild>
              <Pressable style={{width:"25%"}} >
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  style={{ width: '100%', aspectRatio: 1 }}
                />
              </Pressable>
            </Link>
          );
        }}
      />
    </>
  );
}
