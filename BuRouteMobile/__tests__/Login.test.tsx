import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';

// Mock navigation functions
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn(),
}));

// Mock global fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});

describe('Login Component', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Login />);
    expect(getByText('Login')).toBeTruthy();
    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('displays error message when trying to login with empty fields', async () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Login'));
    await waitFor(() => {
      expect(getByText('Please fill in all fields!')).toBeTruthy();
    });
  });

  it('calls the login API on login button press', async () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testUser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'testPassword');
    fireEvent.press(getByText('Login'));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/database_search/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testUser', password: 'testPassword' }),
      });
    });
  });

  it('navigates to WikidataSearch page after successful login', async () => {
    const navigate = jest.fn();
    const { getByPlaceholderText, getByText } = render(<Login />);
    (useNavigation as jest.Mock).mockReturnValue({ navigate });
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testUser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'testPassword');
    fireEvent.press(getByText('Login'));
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('WikidataSearch', expect.any(Object));
    });
  });
});
