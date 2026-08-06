/**
 * @format
 */

import 'react-native';
import React from 'react';
import {Text} from 'react-native';
import App from '../App';

// Note: import explicitly to use the types shiped with jest.
import {it, expect} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});

it('shows the BuddyCall branding', () => {
  const tree = renderer.create(<App />);
  const buddyCallTexts = tree.root.findAllByType(Text).filter(node => node.props.children === 'BuddyCall');

  expect(buddyCallTexts.length).toBeGreaterThan(0);
});
