import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from './signup';

describe('Signup Component', () => {
  test('renders signup form correctly', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password:')).toBeInTheDocument();
    expect(screen.getByLabelText('I agree to the KVKK terms')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    const mockLogin = jest.fn();
    const mockData = { username: 'testuser', email: 'test@example.com' };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testpassword1' } });
    fireEvent.change(screen.getByLabelText('Confirm password:'), { target: { value: 'testpassword1' } });
    fireEvent.click(screen.getByLabelText('I agree to the KVKK terms'));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/database_search/create_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword1',
        }),
      });
      expect(mockLogin).toHaveBeenCalledWith(mockData);
      expect(window.location.href).toEqual('/search');
    });
  });

  test('displays error message on failed signup', async () => {
    const mockError = 'Username already exists';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: mockError }),
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });
  });

});
