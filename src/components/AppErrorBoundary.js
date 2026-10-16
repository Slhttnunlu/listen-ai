import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';
import { styles } from '../styles';

function AppErrorFallback({ resetErrorBoundary }) {
  return (
    <SafeAreaView style={styles.errorPage}>
      <View accessibilityRole="alert" style={styles.errorCard}>
        <Text accessibilityRole="header" style={styles.errorPageTitle}>
          Bir şeyler ters gitti
        </Text>
        <Text style={styles.errorPageMessage}>
          Uygulama beklenmeyen bir hatayla karşılaştı. Yerel kayıtlarınız silinmedi.
        </Text>
        <Pressable
          accessibilityHint="Uygulama ekranlarını güvenli başlangıç durumunda yeniden açar"
          accessibilityRole="button"
          onPress={resetErrorBoundary}
          style={styles.errorRetryButton}
          testID="app-error-retry"
        >
          <Text style={styles.errorRetryText}>Uygulamayı yeniden aç</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function AppErrorBoundary({ children, onError }) {
  const [appKey, setAppKey] = useState(0);

  return (
    <ErrorBoundary
      FallbackComponent={AppErrorFallback}
      onError={(error, info) =>
        onError?.({ errorName: error.name || 'Error', componentStack: info.componentStack })
      }
      onReset={() => setAppKey((current) => current + 1)}
    >
      <View key={appKey} style={styles.safe}>
        {children}
      </View>
    </ErrorBoundary>
  );
}
