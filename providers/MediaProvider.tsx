import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';

type MediaContextType = {
  assets: MediaLibrary.Asset[];
  loadLocalAssets: () => void;
  loading: boolean;
  hasNextPage: boolean;
};

const MediaContext = createContext<MediaContextType>({
  assets: [],
  loadLocalAssets: () => {},
  loading: false,
  hasNextPage: true,
});

export function MediaContextProvider({ children }: PropsWithChildren) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
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
      first: 30,
      after: hasEndCursor,
    });
    console.log(JSON.stringify(assetsPage.assets, null, 2));
    setLocalAssets((existingAssets) => [...existingAssets, ...assetsPage.assets]);
    setHasNextPage(assetsPage.hasNextPage);
    setEndCursor(assetsPage.endCursor);
    setLoading(false);
  };
  return (
    <MediaContext.Provider value={{ assets, loading, loadLocalAssets, hasNextPage }}>
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
