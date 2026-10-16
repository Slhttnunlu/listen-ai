import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ReadAlong } from '../components/ReadAlong';
import { styles } from '../styles';
import { getProgressPercent } from '../utils/text';

export function PlayerScreen({ text, activeRange, rate, onStop, onChangeRate, onBack }) {
  const progress = getProgressPercent(activeRange, text.length);
  return (
    <View testID="player-screen" style={styles.playerPage}>
      <StatusBar style="light" />
      <View style={styles.playerHeader}>
        <Pressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          testID="player-back-button"
          onPress={onBack}
          style={styles.playerBack}
        >
          <Text style={styles.playerBackText}>‹</Text>
        </Pressable>
        <View style={styles.playerTools}>
          <Text style={styles.playerTool}>♧ AI</Text>
          <Text style={styles.playerTool}>Aᴬ</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.readingArea}>
        <ReadAlong text={text} activeRange={activeRange} dark />
      </ScrollView>
      <View style={styles.playerControls}>
        <Text numberOfLines={1} style={styles.nowPlaying}>
          {text.slice(0, 40) || 'Başlıksız metin'}
        </Text>
        <View
          accessibilityLabel={`Dinleme ilerlemesi yüzde ${progress}`}
          testID="playback-progress"
          style={styles.progress}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          <View style={[styles.progressDot, { left: `${progress}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text>{progress}%</Text>
          <Text>—</Text>
        </View>
        <View style={styles.playerButtons}>
          <Text style={styles.avatar}>◉</Text>
          <Text style={styles.skip}>↶₁₀</Text>
          <Pressable
            accessibilityLabel="Dinlemeyi durdur"
            accessibilityRole="button"
            testID="stop-button"
            onPress={onStop}
            style={styles.mainStop}
          >
            <Text style={styles.mainStopText}>■</Text>
          </Pressable>
          <Text style={styles.skip}>↷₁₀</Text>
          <Pressable
            accessibilityLabel={`Oynatma hızı ${rate}`}
            accessibilityRole="button"
            testID="speed-button"
            onPress={onChangeRate}
          >
            <Text style={styles.ratePill}>{rate}×</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
