import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { BottomNav } from '../components/BottomNav';
import { ComposerScreen } from '../screens/ComposerScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { styles } from '../styles';

const flatten = (name) => StyleSheet.flatten(styles[name]);

describe('dynamic type layout safeguards', () => {
  test('content-heavy containers can grow or wrap instead of clipping text', () => {
    expect(flatten('hero')).toMatchObject({ minHeight: 505 });
    expect(flatten('hero').height).toBeUndefined();
    expect(flatten('nav')).toMatchObject({ minHeight: 88 });
    expect(flatten('nav').height).toBeUndefined();

    for (const styleName of [
      'libraryTools',
      'itemActions',
      'setting',
      'entryActions',
      'entryButtons',
    ]) {
      expect(flatten(styleName).flexWrap).toBe('wrap');
    }
  });

  test('critical library and settings values are not forced to one line', () => {
    const longTitle = 'Erişilebilir metin boyutunda tamamı okunması gereken uzun başlık';
    const library = render(
      <LibraryScreen
        ready
        items={[
          {
            id: 1,
            title: longTitle,
            content: 'Metin',
            progress_index: 0,
            is_completed: 0,
            is_favorite: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ]}
        onAdd={jest.fn()}
        onOpen={jest.fn()}
      />
    );
    expect(library.getByText(longTitle).props.numberOfLines).toBeUndefined();

    const settings = render(
      <SettingsScreen
        localTtsEnabled
        ttsEngine="device"
        voice={{ name: 'Çok Uzun Türkçe Sistem Sesi Adı' }}
        voiceCount={2}
      />
    );
    expect(settings.getByText('Cihazın sistem sesi').props.numberOfLines).toBeUndefined();
    expect(
      settings.getByText('Çok Uzun Türkçe Sistem Sesi Adı').props.numberOfLines
    ).toBeUndefined();
  });

  test('primary screens do not opt text out of system font scaling', () => {
    const screens = [
      render(<BottomNav active="home" onChange={jest.fn()} />),
      render(<HomeScreen onFeature={jest.fn()} />),
      render(<LibraryScreen ready items={[]} onAdd={jest.fn()} onOpen={jest.fn()} />),
      render(<SettingsScreen />),
      render(
        <ComposerScreen
          text="Örnek"
          setText={jest.fn()}
          rate={1}
          playing={false}
          onSaveAndPlay={jest.fn()}
          onBack={jest.fn()}
        />
      ),
      render(
        <PlayerScreen
          text="Örnek"
          rate={1}
          playing={false}
          onChangeRate={jest.fn()}
          onResume={jest.fn()}
          onBack={jest.fn()}
        />
      ),
    ];

    for (const screen of screens) {
      for (const text of screen.UNSAFE_getAllByType(Text)) {
        expect(text.props.allowFontScaling).not.toBe(false);
      }
    }
  });
});
