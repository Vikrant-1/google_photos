import { Link, Stack } from 'expo-router';
import { FlatList, Pressable, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useMedia } from '~/providers/MediaProvider';
import { AntDesign } from '@expo/vector-icons';
import { getImagekitUrlFromPath } from '~/utils/imageKit';
import { removeAssetsFromPath } from '~/utils/helper';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';

export default function Home() {
  const { assets, loadLocalAssets, loading, hasNextPage } = useMedia();
  const { width } = useWindowDimensions();

  const itemSize = Math.floor(width / 4);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !loading) {
      loadLocalAssets();
    }
    
  }, [hasNextPage, loading, loadLocalAssets]);


  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        numColumns={4}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        columnWrapperStyle={{ gap: 2 }}
        contentContainerStyle={{ gap: 2 }}
        initialNumToRender={20}
        getItemLayout={(data, index) => ({ length: itemSize, offset: itemSize * index, index })}
        renderItem={({ item }) => {
          return (
            <Link href={`/asset?id=${item.id}`} asChild>
              <Pressable style={{ width: '25%' }}>
                <Image
                  key={item.id}
                  source={{
                    uri: item.isLocalAsset
                      ? item.uri
                      : item.path
                        ? getImagekitUrlFromPath(removeAssetsFromPath(item.path), [
                            {
                              height: 200,
                              width: 200,
                            },
                          ])
                        : item.uri,
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
