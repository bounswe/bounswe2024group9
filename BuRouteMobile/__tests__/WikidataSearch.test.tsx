import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import WikidataSearch from '../WikidataSearch';
import { useNavigation } from '@react-navigation/native';

// Mocking the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.useFakeTimers();

const route = {
    params: {
        currentUser:{
            email:"halil@h.com",
            profile_picture: null,
            user_id: 24,
            username: "halil"
        },
        path: undefined
    }
}

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
    const { getByPlaceholderText } = render(<WikidataSearch route={route}/>);
    expect(getByPlaceholderText('Search Wikidata')).toBeTruthy();
  });

  it('updates searchTerm on TextInput change', () => {
    const { getByPlaceholderText } = render(<WikidataSearch route={route}/>);
    const searchInput = getByPlaceholderText('Search Wikidata');

    fireEvent.changeText(searchInput, 'quantum mechanics');

    expect(searchInput.props.value).toBe('quantum mechanics');
  });

  it('calls the wikidata search API', async () => {
    const { getByPlaceholderText } = render(<WikidataSearch route={route}/>);
    fireEvent.changeText(getByPlaceholderText('Search Wikidata'), 'galata');

    await act(async () => {
      await jest.runAllTimers();
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('wiki_search/search/galata'));
  });

  it('navigates to NodeDetails on node click', async () => {
    const navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate });

    const { getByPlaceholderText, getByText } = render(<WikidataSearch route={route}/>);
    fireEvent.changeText(getByPlaceholderText('Search Wikidata'), 'Node0');

    await act(async () => {
      await jest.runAllTimers();
    });

    const nodeButton = getByText(/Node name: Node0/i);
    fireEvent.press(nodeButton);

    expect(navigate).toHaveBeenCalledWith('NodeDetails', expect.any(Object));
  });
});
