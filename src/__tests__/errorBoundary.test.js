import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppErrorBoundary } from '../components/AppErrorBoundary';

describe('AppErrorBoundary', () => {
  test('shows a safe recovery screen and remounts the app', () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    let shouldThrow = true;
    const onError = jest.fn();

    function UnstableContent() {
      if (shouldThrow) throw new Error('private content must not be displayed');
      return <Text>Uygulama hazır</Text>;
    }

    try {
      const screen = render(
        <AppErrorBoundary onError={onError}>
          <UnstableContent />
        </AppErrorBoundary>
      );

      expect(screen.getByText('Bir şeyler ters gitti')).toBeTruthy();
      expect(screen.queryByText(/private content/)).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ errorName: 'Error', componentStack: expect.any(String) })
      );

      shouldThrow = false;
      fireEvent.press(screen.getByTestId('app-error-retry'));
      expect(screen.getByText('Uygulama hazır')).toBeTruthy();
    } finally {
      console.error = originalConsoleError;
    }
  });
});
