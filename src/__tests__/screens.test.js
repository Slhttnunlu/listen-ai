import { fireEvent, render } from '@testing-library/react-native';
import { BottomNav } from '../components/BottomNav';
import { ComposerScreen } from '../screens/ComposerScreen';
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

  test('does not advertise a trial or Pro plan before billing is available', () => {
    const home = render(<HomeScreen onFeature={jest.fn()} />);
    const library = render(<LibraryScreen ready items={[]} onAdd={jest.fn()} />);

    expect(home.queryByText('Ücretsiz deneyin')).toBeNull();
    expect(library.queryByText('PRO')).toBeNull();
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
    const onPause = jest.fn();
    const screen = render(
      <PlayerScreen
        text="Kısa test metni"
        rate={1}
        playing
        onChangeRate={onChangeRate}
        onPause={onPause}
        onBack={jest.fn()}
      />
    );
    fireEvent.press(screen.getByTestId('speed-button'));
    fireEvent.press(screen.getByTestId('pause-button'));
    expect(onChangeRate).toHaveBeenCalledTimes(1);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  test('does not show unfinished AI, formatting, or skip controls in the player', () => {
    const screen = render(
      <PlayerScreen
        text="Kısa test metni"
        rate={1}
        playing
        onChangeRate={jest.fn()}
        onPause={jest.fn()}
        onBack={jest.fn()}
      />
    );

    expect(screen.queryByText('♧ AI')).toBeNull();
    expect(screen.queryByText('Aᴬ')).toBeNull();
    expect(screen.queryByText('↶₁₀')).toBeNull();
    expect(screen.queryByText('↷₁₀')).toBeNull();
  });

  test('keeps the player open after playback and lets the user replay', () => {
    const onResume = jest.fn();
    const screen = render(
      <PlayerScreen
        text="Kısa test metni"
        rate={1}
        playing={false}
        onChangeRate={jest.fn()}
        onResume={onResume}
        onPause={jest.fn()}
        onBack={jest.fn()}
      />
    );

    fireEvent.press(screen.getByTestId('resume-button'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  test('returns from the player to the editor without closing the composer route', () => {
    const onBack = jest.fn();
    const onPlayerBack = jest.fn();
    const screen = render(
      <ComposerScreen
        text="Düzenlenebilir metin"
        setText={jest.fn()}
        rate={1}
        playing={false}
        playerOpen
        onPause={jest.fn()}
        onResume={jest.fn()}
        onSaveAndPlay={jest.fn()}
        onChangeRate={jest.fn()}
        onBack={onBack}
        onPlayerBack={onPlayerBack}
      />
    );

    fireEvent.press(screen.getByTestId('player-back-button'));
    expect(onPlayerBack).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  test('opens feedback from settings', () => {
    const onFeedback = jest.fn();
    const screen = render(<SettingsScreen onFeedback={onFeedback} />);
    fireEvent.press(screen.getByTestId('feedback-button'));
    expect(onFeedback).toHaveBeenCalledTimes(1);
  });

  test('changes the default voice and playback rate from settings', () => {
    const onChangeVoice = jest.fn();
    const onChangeRate = jest.fn();
    const screen = render(
      <SettingsScreen
        rate={1.25}
        voice={{ name: 'Türkçe Ses' }}
        voiceCount={2}
        onChangeVoice={onChangeVoice}
        onChangeRate={onChangeRate}
      />
    );
    expect(screen.getByText('Türkçe Ses')).toBeTruthy();
    expect(screen.getByText('1.25×')).toBeTruthy();
    fireEvent.press(screen.getByTestId('voice-setting'));
    fireEvent.press(screen.getByTestId('rate-setting'));
    expect(onChangeVoice).toHaveBeenCalledTimes(1);
    expect(onChangeRate).toHaveBeenCalledTimes(1);
  });

  test('switches between device and the Mac local TTS service', () => {
    const onChangeTtsEngine = jest.fn();
    const screen = render(
      <SettingsScreen
        localTtsEnabled
        ttsEngine="mac-local-api"
        onChangeTtsEngine={onChangeTtsEngine}
      />
    );
    expect(screen.getByText('Mac yerel AI sesi')).toBeTruthy();
    fireEvent.press(screen.getByTestId('tts-engine-setting'));
    expect(onChangeTtsEngine).toHaveBeenCalledTimes(1);
  });

  test('opens privacy and terms documents from settings', () => {
    const onPrivacy = jest.fn();
    const onTerms = jest.fn();
    const screen = render(
      <SettingsScreen onFeedback={jest.fn()} onPrivacy={onPrivacy} onTerms={onTerms} />
    );
    fireEvent.press(screen.getByTestId('privacy-button'));
    fireEvent.press(screen.getByTestId('terms-button'));
    expect(onPrivacy).toHaveBeenCalledTimes(1);
    expect(onTerms).toHaveBeenCalledTimes(1);
  });

  test('exposes explicit local data export and delete actions', () => {
    const onExportData = jest.fn();
    const onImportData = jest.fn();
    const onDeleteData = jest.fn();
    const screen = render(
      <SettingsScreen
        onFeedback={jest.fn()}
        onExportData={onExportData}
        onImportData={onImportData}
        onDeleteData={onDeleteData}
      />
    );
    fireEvent.press(screen.getByTestId('export-data-button'));
    fireEvent.press(screen.getByTestId('import-data-button'));
    fireEvent.press(screen.getByTestId('delete-data-button'));
    expect(onExportData).toHaveBeenCalledTimes(1);
    expect(onImportData).toHaveBeenCalledTimes(1);
    expect(onDeleteData).toHaveBeenCalledTimes(1);
  });
});
