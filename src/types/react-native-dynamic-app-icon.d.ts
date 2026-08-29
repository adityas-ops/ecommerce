declare module 'react-native-dynamic-app-icon' {
  export interface AppIconResult {
    iconName: string;
  }

  export function setAppIcon(name: string | null): void;
  export function supportsDynamicAppIcon(): Promise<boolean>;
  export function getIconName(callback: (result: AppIconResult) => void): void;

  const AppIcon: {
    setAppIcon: typeof setAppIcon;
    supportsDynamicAppIcon: typeof supportsDynamicAppIcon;
    getIconName: typeof getIconName;
  };

  export default AppIcon;
}
