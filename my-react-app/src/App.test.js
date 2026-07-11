import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Helper function to wrap components in Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

test("renders navbar links", () => {
  renderWithRouter(<App />);
  
  expect(screen.getByText(/Menu/i)).toBeInTheDocument();
  expect(screen.getByText(/Cart/i)).toBeInTheDocument();
  expect(screen.getByText(/Admin/i)).toBeInTheDocument();
});

test("renders menu page correctly", () => {
  renderWithRouter(<App />);
  
  expect(screen.getByText(/Menu Page/i)).toBeInTheDocument();
});

test("renders admin page when navigating", () => {
  renderWithRouter(<App />);
  
  expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
});
