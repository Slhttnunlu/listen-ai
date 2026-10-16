import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, Linking, SafeAreaView } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { useLibrary } from './src/hooks/useLibrary';
import { useSpeechPlayer } from './src/hooks/useSpeechPlayer';
import { ComposerScreen } from './src/screens/ComposerScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { pickTextDocument } from './src/services/documents';
import { styles } from './src/styles';
import { DEFAULT_TEXT } from './src/utils/text';

export default function App() {
  const [tab, setTab] = useState('home');
  const [composerOpen, setComposerOpen] = useState(false);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [currentItem, setCurrentItem] = useState(null);

  const showLibraryError = useCallback(() => {
    Alert.alert('Kütüphane açılamadı', 'Yerel kayıt alanı başlatılamadı.');
  }, []);
  const showSpeechError = useCallback((message) => {
    Alert.alert('Seslendirme hatası', message);
  }, []);

  const {
    deleteItem,
    items,
    ready,
    renameItem,
    restoreItem,
    saveText,
    saveProgress,
    toggleFavorite,
  } = useLibrary({ onError: showLibraryError });
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
    setComposerOpen(true);
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
          setComposerOpen(true);
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
      setComposerOpen(true);
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
    stop();
    setComposerOpen(false);
  }, [stop]);

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
      {composerOpen ? (
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
      ) : (
        <>
          {tab === 'home' && <HomeScreen onFeature={useFeature} />}
          {tab === 'library' && (
            <LibraryScreen
              items={items}
              ready={ready}
              onAdd={startNewText}
              onOpen={openItem}
              onRename={renameItem}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteItem}
              onRestore={restoreItem}
            />
          )}
          {tab === 'settings' && <SettingsScreen onFeedback={openFeedback} />}
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}
    </SafeAreaView>
  );
}
