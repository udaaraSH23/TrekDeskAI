import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input Component", () => {
  it("renders label correctly", () => {
    render(<Input label="Username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("displays error message when provided", () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText("Invalid input")).toBeInTheDocument();
  });

  it("displays helper text", () => {
    render(<Input helperText="Enter your name" />);
    expect(screen.getByText("Enter your name")).toBeInTheDocument();
  });

  it("updates value on change", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");

    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });
});
