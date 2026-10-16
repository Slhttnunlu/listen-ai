import { StatusBar } from 'expo-status-bar';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { useLibrary } from './src/hooks/useLibrary';
import { useSpeechPlayer } from './src/hooks/useSpeechPlayer';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ComposerScreen } from './src/screens/ComposerScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { pickTextDocument } from './src/services/documents';
import { styles } from './src/styles';
import { DEFAULT_TEXT } from './src/utils/text';

const navigationRef = createNavigationContainerRef();

export function AppContent() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [currentItem, setCurrentItem] = useState(null);

  const showSpeechError = useCallback((message) => {
    Alert.alert('Seslendirme hatası', message);
  }, []);

  const {
    deleteItem,
    items,
    loadError,
    ready,
    reload,
    renameItem,
    restoreItem,
    saveText,
    saveProgress,
    toggleFavorite,
  } = useLibrary({});
  const { activeRange, changeRate, play, playing, rate, stop } = useSpeechPlayer({
    text,
    itemId: currentItem?.id,
    initialIndex: currentItem?.progress_index || 0,
    onProgress: saveProgress,
    onError: showSpeechError,
  });

  const startNewText = useCallback(() => {
    stop();
    setCurrentItem(null);
    setText(DEFAULT_TEXT);
    if (navigationRef.isReady()) navigationRef.navigate('composer');
  }, [stop]);

  const useFeature = useCallback(
    async (id) => {
      if (id === 'write') {
        startNewText();
      } else if (id === 'document') {
        try {
          const document = await pickTextDocument();
          if (!document) return;
          stop();
          setCurrentItem(null);
          setText(document.content);
          if (navigationRef.isReady()) navigationRef.navigate('composer');
        } catch (error) {
          Alert.alert('Dosya açılamadı', error.message || 'Metin dosyası okunamadı.');
        }
      } else {
        Alert.alert(
          'Yakında',
          'Bu özellik ürün planına eklendi. Önce metin dinleme akışını tamamlıyoruz.'
        );
      }
    },
    [startNewText, stop]
  );

  const openItem = useCallback(
    (item) => {
      stop();
      setText(item.content);
      setCurrentItem(item);
      if (navigationRef.isReady()) navigationRef.navigate('composer');
    },
    [stop]
  );

  const saveAndPlay = useCallback(async () => {
    if (!text.trim()) {
      Alert.alert('Metin gerekli', 'Dinlemek için önce bir metin girin.');
      return;
    }
    try {
      const item = currentItem || (await saveText(text));
      setCurrentItem(item);
      play(rate, item.progress_index || 0, item.id);
    } catch {
      Alert.alert('Kaydedilemedi', 'Metin yerel kütüphaneye kaydedilemedi.');
    }
  }, [currentItem, play, rate, saveText, text]);

  const closeComposer = useCallback(() => {
    if (navigationRef.canGoBack()) navigationRef.goBack();
  }, []);

  const openFeedback = useCallback(async () => {
    try {
      await Linking.openURL('https://github.com/Slhttnunlu/listen-ai/issues/new');
    } catch {
      Alert.alert('Bağlantı açılamadı', 'Geri bildirim sayfası şu anda açılamıyor.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <AppNavigator
        navigationRef={navigationRef}
        onComposerBlur={stop}
        home={<HomeScreen onFeature={useFeature} />}
        library={
          <LibraryScreen
            items={items}
            ready={ready}
            loadError={loadError}
            onRetry={reload}
            onAdd={startNewText}
            onOpen={openItem}
            onRename={renameItem}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteItem}
            onRestore={restoreItem}
          />
        }
        settings={<SettingsScreen onFeedback={openFeedback} />}
        composer={
          <ComposerScreen
            text={text}
            setText={setText}
            rate={rate}
            playing={playing}
            activeRange={activeRange}
            onStop={stop}
            onSaveAndPlay={saveAndPlay}
            onChangeRate={changeRate}
            onBack={closeComposer}
          />
        }
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
