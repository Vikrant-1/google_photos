export const removeAssetsFromPath = (path:string) => {
    if (path.startsWith('assets/')) {
        return path.replace('assets/', '');
    }
    return path;

}