import { fireEvent, render } from '@testing-library/react-native';
import { BottomNav } from '../components/BottomNav';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

describe('screen interactions', () => {
  test('routes bottom navigation presses through the navigator callback', () => {
    const onChange = jest.fn();
    const screen = render(<BottomNav active="home" onChange={onChange} />);
    fireEvent.press(screen.getByTestId('nav-library'));
    expect(onChange).toHaveBeenCalledWith('library');
  });

  test('opens the write feature from home', () => {
    const onFeature = jest.fn();
    const screen = render(<HomeScreen onFeature={onFeature} />);
    fireEvent.press(screen.getByTestId('feature-write'));
    expect(onFeature).toHaveBeenCalledWith('write');
  });

  test('filters library items using real state fields', () => {
    const screen = render(
      <LibraryScreen
        ready
        items={[
          {
            id: 1,
            title: 'Yarım kalan metin',
            content: 'a',
            progress_index: 4,
            is_completed: 0,
            is_favorite: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            title: 'Bitti',
            content: 'b',
            progress_index: 0,
            is_completed: 1,
            is_favorite: 0,
            created_at: '2026-01-02T00:00:00.000Z',
          },
        ]}
        onAdd={jest.fn()}
        onOpen={jest.fn()}
      />
    );
    fireEvent.press(screen.getByText('Tamamlandı'));
    expect(screen.getByText('Bitti')).toBeTruthy();
    expect(screen.queryByText('Yarım kalan metin')).toBeNull();
  });

  test('retries when the local library cannot be loaded', () => {
    const onRetry = jest.fn();
    const screen = render(
      <LibraryScreen
        ready
        loadError
        items={[]}
        onAdd={jest.fn()}
        onOpen={jest.fn()}
        onRetry={onRetry}
      />
    );
    expect(screen.getByText('Kütüphane yüklenemedi')).toBeTruthy();
    fireEvent.press(screen.getByTestId('library-retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('keeps player callbacks attached to their controls', () => {
    const onChangeRate = jest.fn();
    const onStop = jest.fn();
    const screen = render(
      <PlayerScreen
        text="Kısa test metni"
        rate={1}
        onChangeRate={onChangeRate}
        onStop={onStop}
        onBack={jest.fn()}
      />
    );
    fireEvent.press(screen.getByTestId('speed-button'));
    fireEvent.press(screen.getByTestId('stop-button'));
    expect(onChangeRate).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  test('opens feedback from settings', () => {
    const onFeedback = jest.fn();
    const screen = render(<SettingsScreen onFeedback={onFeedback} />);
    fireEvent.press(screen.getByTestId('feedback-button'));
    expect(onFeedback).toHaveBeenCalledTimes(1);
  });
});
