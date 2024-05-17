import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CreateRoute from '../RouteCreation';
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

describe('RouteCreation', () => {

    it('renders correctly', () => {
        const {getByText, getByPlaceholderText} = render(<CreateRoute route={route}/>);
        expect(getByText('Create Route')).toBeTruthy();
        expect(getByPlaceholderText('Route Title')).toBeTruthy();
        expect(getByPlaceholderText('Search POI')).toBeTruthy();
        expect(getByPlaceholderText('Add Description')).toBeTruthy();
        expect(getByText('Save')).toBeTruthy();
    });

    it('updates title on TextInput change', () => {
    const {getByPlaceholderText} = render(<CreateRoute route={route}/>);
    const titleInput = getByPlaceholderText('Route Title');

    fireEvent.changeText(titleInput, 'test title');

    expect(titleInput.props.value).toBe('test title');
    });

    it ('updates description on TextInput change', () => {
        const {getByPlaceholderText} = render(<CreateRoute route={route}/>);
        const descInput = getByPlaceholderText('Add Description');

        fireEvent.changeText(descInput, 'line 1 \n line 2');

        expect(descInput.props.value).toBe('line 1 \n line 2');
    });
});