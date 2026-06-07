import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { register, login } = vi.hoisted(() => ({ register: vi.fn(), login: vi.fn() }));

vi.mock("../api/auth-client", () => ({
  register,
  login,
  DASHBOARD_PATH: "/app",
  ApiError: class ApiError extends Error {
    status = 0;
    code = "error";
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SignupForm } from "./signup-form";

describe("SignupForm", () => {
  beforeEach(() => {
    register.mockReset();
    login.mockReset();
  });

  it("validates all fields and does not call the API for invalid input", async () => {
    render(<SignupForm onSuccess={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/display name/i)).toHaveAttribute("aria-invalid", "true");
    });
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("aria-invalid", "true");
    expect(register).not.toHaveBeenCalled();
  });

  it("rejects a too-short password", async () => {
    render(<SignupForm onSuccess={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/display name/i), "Game Master");
    await userEvent.type(screen.getByLabelText(/email/i), "dm@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "short");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/password/i)).toHaveAttribute("aria-invalid", "true");
    });
    expect(register).not.toHaveBeenCalled();
  });

  it("registers, logs in, and invokes onSuccess for valid input", async () => {
    register.mockResolvedValueOnce({ user: { id: "1" } });
    login.mockResolvedValueOnce({ user: { id: "1" } });
    const onSuccess = vi.fn();
    render(<SignupForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/display name/i), "Game Master");
    await userEvent.type(screen.getByLabelText(/email/i), "dm@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "supersecret");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        displayName: "Game Master",
        email: "dm@example.com",
        password: "supersecret",
      });
    });
    await waitFor(() => expect(login).toHaveBeenCalledOnce());
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
