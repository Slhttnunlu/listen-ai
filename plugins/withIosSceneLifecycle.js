const { withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';

function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, (nextConfig) => {
    nextConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return nextConfig;
  });

  return withAppDelegate(config, (nextConfig) => {
    const contents = nextConfig.modResults.contents;
    if (contents.includes('ExpoReactNativeFactoryProvider')) return nextConfig;

    const updatedContents = contents
      .replace(
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
      )
      .replace(
        /#if os\(iOS\) \|\| os\(tvOS\)\n    window = UIWindow\(frame: UIScreen\.main\.bounds\)\n    factory\.startReactNative\(\n      withModuleName: "main",\n      in: window,\n      launchOptions: launchOptions\)\n#endif\n/,
        ''
      );

    if (updatedContents === contents) {
      throw new Error('iOS AppDelegate şablonu UIScene yaşam döngüsü için güncellenemedi.');
    }
    nextConfig.modResults.contents = updatedContents;
    return nextConfig;
  });
}

module.exports = withIosSceneLifecycle;
