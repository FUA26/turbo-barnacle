import { FormField } from "@/components/form/fields/form-field";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

describe("FormField", () => {
  it("renders label and input", () => {
    function TestForm() {
      const { control } = useForm({
        defaultValues: { email: "" },
      });

      return (
        <FormField
          control={control}
          name="email"
          label="Email"
          render={({ field }) => <input {...field} />}
        />
      );
    }

    render(<TestForm />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    function TestForm() {
      const { control } = useForm({
        defaultValues: { email: "" },
      });

      return (
        <FormField
          control={control}
          name="email"
          label="Email"
          description="Enter your email address"
          render={({ field }) => <input {...field} />}
        />
      );
    }

    render(<TestForm />);

    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("displays required indicator", () => {
    function TestForm() {
      const { control } = useForm({
        defaultValues: { email: "" },
      });

      return (
        <FormField
          control={control}
          name="email"
          label="Email"
          required
          render={({ field }) => <input {...field} />}
        />
      );
    }

    render(<TestForm />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
