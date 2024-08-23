import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedia } from '~/providers/MediaProvider';
import { getImagekitUrlFromPath } from '~/utils/imageKit';

export default function AssetPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { getAssetsById, syncToCloud } = useMedia();
  const asset = getAssetsById(id);
  console.log(asset);

  if (!asset) {
    return <Text>Asset not found</Text>;
  }

  const uri = getImagekitUrlFromPath('2df5dd82-7189-4042-b9fb-9f7b0b2cc1de/IMG20200920174043.jpg', [
    {
      height: 200,
      width: 200,
    },
  ]);  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photo',
          headerRight: () => (
            <AntDesign
              onPress={() => syncToCloud(asset)}
              name="cloudupload"
              size={24}
              color={'black'}
            />
          ),
        }}
      />
      <Image source={{ uri: uri }} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
