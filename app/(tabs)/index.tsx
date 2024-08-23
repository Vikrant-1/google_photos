import { Link, Stack } from 'expo-router';
import { FlatList, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { useMedia } from '~/providers/MediaProvider';
import { AntDesign } from '@expo/vector-icons';
import { getImagekitUrlFromPath } from '~/utils/imageKit';
import { removeAssetsFromPath } from '~/utils/helper';

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
              <Pressable style={{ width: '25%' }}>
                <Image
                  key={item.id}
                  source={{
                    uri: item.isLocalAsset
                      ? item.uri
                      : getImagekitUrlFromPath(removeAssetsFromPath(item.path), [
                          {
                            height: 200,
                            width: 200,
                          },
                        ]),
                  }}
                  style={{ width: '100%', aspectRatio: 1 }}
                />
                {!item.isBackedUp && item.isLocalAsset && (
                  <AntDesign
                    name="cloudupload"
                    size={18}
                    color={'#fff'}
                    className="absolute bottom-1 right-1"
                  />
                )}
              </Pressable>
            </Link>
          );
        }}
      />
    </>
  );
}
