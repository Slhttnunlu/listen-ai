import { Pressable, Text, View } from 'react-native';
import { NAV_ITEMS } from '../constants/features';
import { styles } from '../styles';

export function BottomNav({ active, onChange }) {
  return (
    <View style={styles.nav}>
      {NAV_ITEMS.map(([id, icon, label]) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: active === id }}
          key={id}
          onPress={() => onChange(id)}
          style={styles.navItem}
          testID={`nav-${id}`}
        >
          <Text style={[styles.navIcon, active === id && styles.navOn]}>{icon}</Text>
          <Text style={[styles.navLabel, active === id && styles.navOn]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
