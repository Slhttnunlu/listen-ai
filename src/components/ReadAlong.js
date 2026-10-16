import { Text, View } from 'react-native';
import { styles } from '../styles';
import { rangesOverlap, splitTextWithRanges } from '../utils/text';

export function ReadAlong({ text, activeRange, dark = false }) {
  if (!text) return null;
  return (
    <View style={[styles.readAlong, dark && styles.readAlongDark]}>
      <Text style={[styles.readText, dark && styles.readTextDark]}>
        {splitTextWithRanges(text).map(({ part, start, end }, index) => (
          <Text
            key={`${start}-${index}`}
            style={rangesOverlap({ start, end }, activeRange) ? styles.readActive : undefined}
          >
            {part}
          </Text>
        ))}
      </Text>
    </View>
  );
}
