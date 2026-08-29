module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-dynamic-app-icon|react-native-mmkv|@react-navigation|react-redux|@reduxjs)/)',
  ],
};
