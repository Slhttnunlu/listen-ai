import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';

export function SettingsScreen({ onFeedback, onPrivacy, onTerms, onExportData, onDeleteData }) {
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
      <Text style={styles.settingsSection}>VERİLERİNİZ</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onExportData}
        style={styles.setting}
        testID="export-data-button"
      >
        <Text style={styles.settingText}>Kütüphaneyi dışa aktar</Text>
        <Text accessible={false} style={styles.chevron}>
          ›
        </Text>
      </Pressable>
      <Pressable
        accessibilityHint="Tüm kayıtlı metinleri ve dinleme ilerlemesini kalıcı olarak siler"
        accessibilityRole="button"
        onPress={onDeleteData}
        style={styles.setting}
        testID="delete-data-button"
      >
        <Text style={styles.destructiveSettingText}>Tüm yerel verileri sil</Text>
        <Text accessible={false} style={styles.chevron}>
          ›
        </Text>
      </Pressable>
      <Text style={styles.settingsSection}>YASAL VE DESTEK</Text>
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
