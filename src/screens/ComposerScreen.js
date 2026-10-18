import * as Clipboard from 'expo-clipboard';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { styles } from '../styles';
import { PlayerScreen } from './PlayerScreen';

export function ComposerScreen({
  text,
  setText,
  rate,
  playing,
  playerOpen,
  activeRange,
  onPause,
  onResume,
  onSaveAndPlay,
  onChangeRate,
  onBack,
}) {
  const paste = async () => {
    const value = await Clipboard.getStringAsync();
    if (value) setText(value);
    else Alert.alert('Pano boş', 'Yapıştırılacak bir metin bulunamadı.');
  };

  if (playerOpen) {
    return (
      <PlayerScreen
        text={text}
        activeRange={activeRange}
        rate={rate}
        playing={playing}
        onPause={onPause}
        onResume={onResume}
        onChangeRate={onChangeRate}
        onBack={onBack}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      style={styles.white}
    >
      <View style={styles.composerHead}>
        <Pressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          testID="back-button"
          onPress={onBack}
          style={styles.headerBackButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.composerTitle}>
          Metin ekle
        </Text>
        <View />
      </View>
      <View style={styles.entryPage}>
        <View style={styles.entryActions}>
          <Text style={styles.label}>METNİNİZ</Text>
          <View style={styles.entryButtons}>
            <Pressable
              accessibilityRole="button"
              testID="paste-button"
              onPress={paste}
              style={styles.textActionButton}
            >
              <Text style={styles.entryAction}>Yapıştır</Text>
            </Pressable>
            {text.length > 0 && (
              <Pressable
                accessibilityRole="button"
                testID="clear-button"
                onPress={() => setText('')}
                style={styles.textActionButton}
              >
                <Text style={styles.clearAction}>⌫ Temizle</Text>
              </Pressable>
            )}
          </View>
        </View>
        <TextInput
          accessibilityLabel="Dinlenecek metin"
          testID="text-input"
          autoFocus
          value={text}
          onChangeText={setText}
          multiline
          style={styles.entryInput}
          textAlignVertical="top"
          placeholder="Dinlemek istediğiniz metni buraya yazın veya yapıştırın…"
          placeholderTextColor="#999"
        />
        <View style={styles.entryFooter}>
          <Pressable
            accessibilityRole="button"
            testID="save-and-listen-button"
            onPress={onSaveAndPlay}
            style={styles.listenButton}
          >
            <Text style={styles.listenButtonText}>Kaydet ve Dinle</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
