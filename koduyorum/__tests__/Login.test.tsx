import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Login from '../src/Login';
importApp from '../App';
s
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Login Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  test('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Login />);

    // Check static text and placeholders
    expect(getByText('Log in to')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  test('shows error when fields are empty on login attempt', async () => {
    const { getByText } = render(<Login />);

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Please fill in all fields!')).toBeTruthy();
    });
  });

  test('navigates to the Signup screen when "Sign Up" is pressed', () => {
    const { getByText } = render(<Login />);

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/signup');
  });

  test('shows success message and navigates to QuestionList on successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', user_id: '12345' }),
      })
    );

    const { getByText, getByPlaceholderText } = render(<Login />);

    // Simulate input
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'testpassword');

    // Simulate login button press
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Login successful! Logging you in...')).toBeTruthy();
      expect(mockRouter.push).toHaveBeenCalledWith('/questionList', { username: 'testuser', user_id: '12345' });
    });
  });

  test('shows error message on failed login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    const { getByText, getByPlaceholderText } = render(<Login />);

    // Simulate input
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'wronguser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');

    // Simulate login button press
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Invalid username or password! Please try again.')).toBeTruthy();
    });
  });

  test('shows error message when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    const { getByText, getByPlaceholderText } = render(<Login />);

    // Simulate input
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'testpassword');

    // Simulate login button press
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Login failed, please try again later.')).toBeTruthy();
    });
  });
});
