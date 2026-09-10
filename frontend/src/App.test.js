import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the ZeroWaste application shell', () => {
  render(<App />);
  expect(screen.getAllByText(/ZeroWaste/i)[0]).toBeInTheDocument();
});
