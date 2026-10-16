import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';

export function SettingsScreen({ onFeedback, onPrivacy, onTerms }) {
  return (
    <ScrollView style={styles.white} contentContainerStyle={styles.settings}>
      <Text style={styles.libTitle}>Ayarlar</Text>
      <Text style={styles.intro}>Dinleme deneyiminizi kişiselleştirin.</Text>
      {['Varsayılan ses', 'Oynatma hızı', 'Bildirimler'].map((name) => (
        <View key={name} style={styles.setting}>
          <Text style={styles.settingText}>{name}</Text>
          <Text style={styles.settingStatus}>Yakında</Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="link"
        onPress={onPrivacy}
        style={styles.setting}
        testID="privacy-button"
      >
        <Text style={styles.settingText}>Gizlilik Politikası</Text>
        <Text accessible={false} style={styles.chevron}>
          ›
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={onTerms}
        style={styles.setting}
        testID="terms-button"
      >
        <Text style={styles.settingText}>Kullanım Koşulları</Text>
        <Text accessible={false} style={styles.chevron}>
          ›
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={onFeedback}
        style={styles.setting}
        testID="feedback-button"
      >
        <Text style={styles.settingText}>Yardım ve geri bildirim</Text>
        <Text accessible={false} style={styles.chevron}>
          ›
        </Text>
      </Pressable>
    </ScrollView>
  );
}
