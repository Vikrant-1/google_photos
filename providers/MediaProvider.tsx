import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '~/utils/supabase';
import { useAuth } from './AuthProvider';
import mime from 'mime';

type MediaContextType = {
  assets: MediaLibrary.Asset[];
  loadLocalAssets: () => void;
  loading: boolean;
  hasNextPage: boolean;
  getAssetsById: (id: String) => MediaLibrary.Asset | undefined;
  syncToCloud: (asset: MediaLibrary.Asset) => Promise<void>;
};

const MediaContext = createContext<MediaContextType>({
  assets: [],
  loadLocalAssets: () => {},
  loading: false,
  hasNextPage: true,
  getAssetsById: () => undefined,
  syncToCloud: async () => {},
});

export function MediaContextProvider({ children }: PropsWithChildren) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasEndCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      first: 30,
      after: hasEndCursor,
    });
    // console.log(JSON.stringify(assetsPage.assets, null, 2));
    setLocalAssets((existingAssets) => [...existingAssets, ...assetsPage.assets]);
    setHasNextPage(assetsPage.hasNextPage);
    setEndCursor(assetsPage.endCursor);
    setLoading(false);
  };

  const getAssetsById = (id: String) => {
    return assets.find((asset) => asset.id === id);
  };

  const syncToCloud = async (asset: MediaLibrary.Asset) => {
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    if (!info.localUri) return;
    const base64String = await FileSystem.readAsStringAsync(info.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64String);

    const { data: storedFile, error } = await supabase.storage
      .from('assets')
      .upload(`${user?.id}/${asset.filename}`, arrayBuffer, {
        contentType: mime.getType(asset.filename) ?? 'image/jpeg',
        upsert: true,
      });

    if (storedFile) {
      const { data, error } = await supabase
        .from('assets')
        .upsert({
          id: asset.id,
          path: storedFile?.fullPath,
          user_id: user?.id,
          mediaType: asset.mediaType,
          object_id: storedFile.id,
        })
        .select()
        .single();
      console.log(data, error);
    }
  };
  return (
    <MediaContext.Provider
      value={{ assets, loading, loadLocalAssets, hasNextPage, getAssetsById, syncToCloud }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
