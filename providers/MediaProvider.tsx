import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '~/utils/supabase';
import { useAuth } from './AuthProvider';
import mime from 'mime';

type MediaLibraryAsset = MediaLibrary.Asset & {
  isBackedUp: boolean;
  isLocalAsset: boolean;
  path?: string;
};

type MediaContextType = {
  assets: MediaLibraryAsset[];
  loadLocalAssets: () => void;
  loading: boolean;
  hasNextPage: boolean;
  getAssetsById: (id: String) => MediaLibraryAsset  | undefined;
  syncToCloud: (asset: MediaLibraryAsset) => Promise<void>;
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
  const [localAssets, setLocalAssets] = useState<MediaLibraryAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasEndCursor, setEndCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [remoteAssets, setRemoteAssets] = useState<MediaLibraryAsset[]>([]);
  const { user } = useAuth();

  const assets = [...remoteAssets, ...localAssets.filter((assets) => !assets.isBackedUp)];


  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permissionResponse?.status === 'granted') {
      loadRemoteAssets();
      loadLocalAssets();
    }
  }, [permissionResponse]);

  const loadRemoteAssets = async () => {
    const { data, error } = await supabase.from('assets').select('*');
    if (data) {
      setRemoteAssets(data);
    }
  };

  const loadLocalAssets = async () => {
    if (loading || !hasNextPage) return;
    setLoading(true);
  
    try {
      const assetsPage = await MediaLibrary.getAssetsAsync({
        after: hasEndCursor,
        mediaType: [MediaLibrary.MediaType.video,MediaLibrary.MediaType.photo],
        first: 100,
        sortBy: [MediaLibrary.SortBy.mediaType, MediaLibrary.SortBy.creationTime],
        
      });
  
      const assetIds = assetsPage.assets.map((asset) => asset.id);
  
      // Batch request to check if assets are backed up
      const { data: backedUpAssets, error } = await supabase
        .from('assets')
        .select('id')
        .in('id', assetIds);
  
      if (error) {
        console.error('Error fetching backed up assets:', error);
        setLoading(false);
        return;
      }

  
      const backedUpAssetIds = new Set(backedUpAssets.map((asset) => asset.id));
  
      const newAssets = assetsPage.assets.map((asset) => ({
        ...asset,
        isBackedUp: backedUpAssetIds.has(asset.id),
        isLocalAsset: true,
      }));
  
      setLocalAssets((existingAssets) => [...existingAssets, ...newAssets]);
      setHasNextPage(assetsPage.hasNextPage);
      setEndCursor(assetsPage.endCursor);
    } catch (error) {
      console.error('Error loading local assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetsById = (id: String) => {
    return assets.find((asset) => asset.id === id);
  };

  const syncToCloud = async (asset: MediaLibraryAsset) => {
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
      value={{
        assets,
        loading,
        loadLocalAssets,
        hasNextPage,
        getAssetsById,
        syncToCloud,
      }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
