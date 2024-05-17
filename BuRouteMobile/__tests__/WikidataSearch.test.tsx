import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import WikidataSearch from './WikidataSearch';
import { useNavigation } from '@react-navigation/native';

// Mocking the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock global fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: { bindings: [] } })
  })
);

beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

describe('WikidataSearch', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<WikidataSearch />);
    expect(getByPlaceholderText('Search Wikidata')).toBeTruthy();
  });

  it('updates searchTerm on TextInput change', () => {
    const { getByPlaceholderText } = render(<WikidataSearch />);
    const searchInput = getByPlaceholderText('Search Wikidata');

    fireEvent.changeText(searchInput, 'quantum mechanics');

    expect(searchInput.props.value).toBe('quantum mechanics');
  });

  it('calls the wikidata search API', async () => {
    const { getByPlaceholderText } = render(<WikidataSearch />);
    fireEvent.changeText(getByPlaceholderText('Search Wikidata'), 'Einstein');

    await act(async () => {
      await jest.runAllTimers();
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('wiki_search/search/Einstein'));
  });

  it('navigates to NodeDetails on node click', () => {
    const navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate });

    const { getByText } = render(<WikidataSearch />);
    const nodeButton = getByText('Node Name: Sample Node');
    fireEvent.press(nodeButton);

    expect(navigate).toHaveBeenCalledWith('NodeDetails', expect.any(Object));
  });
});
