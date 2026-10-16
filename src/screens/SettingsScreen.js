import { ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';

export function SettingsScreen() {
  return (
    <ScrollView style={styles.white} contentContainerStyle={styles.settings}>
      <Text style={styles.libTitle}>Ayarlar</Text>
      <Text style={styles.intro}>Dinleme deneyiminizi kişiselleştirin.</Text>
      {['Varsayılan ses', 'Oynatma hızı', 'Bildirimler', 'Yardım ve geri bildirim'].map((name) => (
        <View key={name} style={styles.setting}>
          <Text style={styles.settingText}>{name}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      ))}
    </ScrollView>
  );
}
