import { Pressable, ScrollView, Text, View } from 'react-native';
import { FEATURES } from '../constants/features';
import { styles } from '../styles';

function Bubble({ style, symbol }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.bubble, style]}
    >
      <Text style={styles.bubbleText}>{symbol}</Text>
    </View>
  );
}

export function HomeScreen({ onFeature }) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.home}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.glow} />
        <Text accessibilityRole="header" style={styles.brand}>
          Listen AI
        </Text>
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.art}>
          <Bubble style={styles.b1} symbol="▤" />
          <Bubble style={styles.b2} symbol="◖◗" />
          <Bubble style={styles.b3} symbol="⌁" />
          <View style={styles.play}>
            <Text style={styles.playText}>▶</Text>
          </View>
        </View>
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={styles.dots}
        >
          <Text style={styles.activeDot}>━</Text>
          <Text style={styles.dot}>● ● ● ● ● ●</Text>
        </View>
        <View style={styles.heroFooter}>
          <Text style={styles.heroTitle}>İstediğiniz zaman, istediğiniz yerde dinleyin</Text>
        </View>
      </View>
      <View style={styles.sheet}>
        <Text accessibilityRole="header" style={styles.sheetTitle}>
          Bugün ne dinlemek istersiniz?
        </Text>
        {FEATURES.map(([id, icon, title, description]) => (
          <Pressable
            accessibilityLabel={`${title}. ${description}`}
            accessibilityRole="button"
            key={id}
            testID={`feature-${id}`}
            onPress={() => onFeature(id)}
            style={styles.card}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{icon}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
