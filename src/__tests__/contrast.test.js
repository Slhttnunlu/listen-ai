import { StyleSheet } from 'react-native';
import { styles } from '../styles';

function rgb(hex) {
  const value = hex.replace('#', '');
  const expanded = value.length === 3 ? value.replace(/./g, (digit) => digit.repeat(2)) : value;
  return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
}

function luminance(hex) {
  const channels = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function colorOf(styleName, property = 'color') {
  return StyleSheet.flatten(styles[styleName])[property];
}

describe('critical text contrast', () => {
  test.each([
    ['cardDesc', '#fff'],
    ['navLabel', '#fff'],
    ['filterText', '#f1f1f1'],
    ['meta', '#fff'],
    ['renameSave', '#fff'],
    ['intro', '#fff'],
    ['settingsSection', '#fff'],
    ['settingStatus', '#fff'],
    ['label', '#fff'],
    ['empty', '#fff'],
    ['entryAction', '#fff'],
    ['clearAction', '#fff'],
    ['listenButtonText', colorOf('listenButton', 'backgroundColor')],
    ['readActive', colorOf('readActive', 'backgroundColor')],
    ['timeText', colorOf('playerControls', 'backgroundColor')],
    ['mainStopText', colorOf('mainStop', 'backgroundColor')],
    ['ratePill', colorOf('playerControls', 'backgroundColor')],
  ])('%s meets WCAG AA against its background', (styleName, background) => {
    expect(contrast(colorOf(styleName), background)).toBeGreaterThanOrEqual(4.5);
  });
});
