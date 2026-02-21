import { InputField } from "@/components/form/fields/input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

describe("InputField", () => {
  it("renders input with label", () => {
    function TestForm() {
      const methods = useForm({ defaultValues: { name: "" } });

      return (
        <FormProvider {...methods}>
          <InputField name="name" label="Name" />
        </FormProvider>
      );
    }

    render(<TestForm />);

    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("allows typing in input", async () => {
    const user = userEvent.setup();

    function TestForm() {
      const methods = useForm({ defaultValues: { name: "" } });

      return (
        <FormProvider {...methods}>
          <InputField name="name" label="Name" />
        </FormProvider>
      );
    }

    render(<TestForm />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.type(input, "John Doe");

    expect(input.value).toBe("John Doe");
  });

  it("renders with placeholder", () => {
    function TestForm() {
      const methods = useForm({ defaultValues: { name: "" } });

      return (
        <FormProvider {...methods}>
          <InputField name="name" label="Name" placeholder="Enter name" />
        </FormProvider>
      );
    }

    render(<TestForm />);

    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });
});
