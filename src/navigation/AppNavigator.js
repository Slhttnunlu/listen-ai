import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNav } from '../components/BottomNav';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const linking = {
  prefixes: ['listenai://'],
  config: {
    screens: {
      main: {
        screens: {
          home: 'home',
          library: 'library',
          settings: 'settings',
        },
      },
      composer: 'compose',
    },
  },
};

function MainTabs({ home, library, settings }) {
  return (
    <Tabs.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state }) => (
        <BottomNav
          active={state.routes[state.index].name}
          onChange={(routeName) => navigation.navigate(routeName)}
        />
      )}
    >
      <Tabs.Screen name="home">{() => home}</Tabs.Screen>
      <Tabs.Screen name="library">{() => library}</Tabs.Screen>
      <Tabs.Screen name="settings">{() => settings}</Tabs.Screen>
    </Tabs.Navigator>
  );
}

export function AppNavigator({ navigationRef, home, library, settings, composer, onComposerBlur }) {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="main">
          {() => <MainTabs home={home} library={library} settings={settings} />}
        </Stack.Screen>
        <Stack.Screen name="composer" listeners={{ blur: onComposerBlur }}>
          {() => composer}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
