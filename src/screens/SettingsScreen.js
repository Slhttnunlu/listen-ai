import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';

export function SettingsScreen({ onFeedback }) {
  return (
    <ScrollView style={styles.white} contentContainerStyle={styles.settings}>
      <Text style={styles.libTitle}>Ayarlar</Text>
      <Text style={styles.intro}>Dinleme deneyiminizi kişiselleştirin.</Text>
      {['Varsayılan ses', 'Oynatma hızı', 'Bildirimler'].map((name) => (
        <View key={name} style={styles.setting}>
          <Text style={styles.settingText}>{name}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={onFeedback}
        style={styles.setting}
        testID="feedback-button"
      >
        <Text style={styles.settingText}>Yardım ve geri bildirim</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </ScrollView>
  );
}
