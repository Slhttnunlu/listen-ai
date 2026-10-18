import { StyleSheet } from 'react-native';
import { styles } from '../styles';

function dimension(styleName, axis) {
  const style = StyleSheet.flatten(styles[styleName]);
  const explicit = Number(style[axis]) || 0;
  const minimum = Number(style[`min${axis[0].toUpperCase()}${axis.slice(1)}`]) || 0;
  return Math.max(explicit, minimum);
}

describe('critical touch target sizes', () => {
  test.each([
    'headerBackButton',
    'moreButton',
    'renameSaveButton',
    'fab',
    'playerBack',
    'mainStop',
    'rateButton',
  ])('%s is at least 44 by 44 points', (styleName) => {
    expect(dimension(styleName, 'width')).toBeGreaterThanOrEqual(44);
    expect(dimension(styleName, 'height')).toBeGreaterThanOrEqual(44);
  });

  test.each([
    'filter',
    'sortButton',
    'textActionButton',
    'itemActionButton',
    'undoButton',
    'retryButton',
    'listenButton',
  ])('%s guarantees at least 44 points of height', (styleName) => {
    expect(dimension(styleName, 'height')).toBeGreaterThanOrEqual(44);
  });
});
