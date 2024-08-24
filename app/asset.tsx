import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedia } from '~/providers/MediaProvider';
import { removeAssetsFromPath } from '~/utils/helper';
import { getImagekitUrlFromPath } from '~/utils/imageKit';

export default function AssetPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getAssetsById, syncToCloud } = useMedia();
  const asset = getAssetsById(id);

  if (!asset) {
    return <Text>Asset not found</Text>;
  }
  let uri;
  if (asset.isLocalAsset) {
    uri = asset.uri;
  } else {
    uri = asset.path
      ? getImagekitUrlFromPath(removeAssetsFromPath(asset.path), [
          {
            height: 200,
            width: 200,
          },
        ])
      : '';
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photo',
          headerRight: () =>
            !asset.isBackedUp ? (
              <AntDesign
                onPress={() => syncToCloud(asset)}
                name="cloudupload"
                size={24}
                color={'black'}
              />
            ) : null,
        }}
      />
      <Image source={{ uri: uri }} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
