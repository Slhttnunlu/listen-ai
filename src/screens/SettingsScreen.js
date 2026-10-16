import { Pressable, ScrollView, Text, View } from 'react-native';
import { TTS_ENGINES } from '../constants/tts';
import { styles } from '../styles';

export function SettingsScreen({
  rate,
  ttsEngine = TTS_ENGINES.device,
  offlineTtsEnabled = false,
  offlineTtsName = 'Offline Türkçe (Deneysel)',
  voice,
  voiceCount = 0,
  onChangeRate,
  onChangeTtsEngine,
  onChangeVoice,
  onFeedback,
  onPrivacy,
  onTerms,
  onExportData,
  onImportData,
  onDeleteData,
}) {
  return (
    <ScrollView style={styles.white} contentContainerStyle={styles.settings}>
      <Text style={styles.libTitle}>Ayarlar</Text>
      <Text style={styles.intro}>Dinleme deneyiminizi kişiselleştirin.</Text>
      {offlineTtsEnabled ? (
        <Pressable
          accessibilityHint="Cihaz sistemi ve deneysel offline model arasında geçiş yapar"
          accessibilityRole="button"
          onPress={onChangeTtsEngine}
          style={styles.setting}
          testID="tts-engine-setting"
        >
          <Text style={styles.settingText}>Ses motoru</Text>
          <Text style={styles.settingStatus} numberOfLines={1}>
            {ttsEngine === TTS_ENGINES.offline ? offlineTtsName : 'Cihazın sistem sesi'}
          </Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityHint={voiceCount > 1 ? 'Sonraki kullanılabilir sesi seçer' : undefined}
        accessibilityRole="button"
        disabled={voiceCount < 2 || ttsEngine === TTS_ENGINES.offline}
        onPress={onChangeVoice}
        style={styles.setting}
        testID="voice-setting"
      >
        <Text style={styles.settingText}>Varsayılan ses</Text>
        <Text style={styles.settingStatus} numberOfLines={1}>
          {voice?.name || (voiceCount ? 'Sistem sesi' : 'Ses bulunamadı')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityHint="Sonraki varsayılan oynatma hızını seçer"
        accessibilityRole="button"
        onPress={onChangeRate}
        style={styles.setting}
        testID="rate-setting"
      >
        <Text style={styles.settingText}>Oynatma hızı</Text>
        <Text style={styles.settingStatus}>{rate || 1}×</Text>
      </Pressable>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Bildirimler</Text>
        <Text style={styles.settingStatus}>Yakında</Text>
      </View>
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
        accessibilityHint="Listen AI JSON yedeğini mevcut kütüphaneyle birleştirir"
        accessibilityRole="button"
        onPress={onImportData}
        style={styles.setting}
        testID="import-data-button"
      >
        <Text style={styles.settingText}>Kütüphane yedeğini içe aktar</Text>
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
