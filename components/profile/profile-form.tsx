"use client";

/**
 * Profile Form Component
 *
 * Form for users to update their profile information
 * Includes name, email, avatar URL, and bio fields
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData: {
    id: string;
    name?: string | null;
    email: string;
    avatar?: string | null;
    bio?: string | null;
  };
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email,
      avatar: initialData.avatar || "",
      bio: initialData.bio || "",
    },
  });

  const avatarValue = form.watch("avatar");

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${initialData.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");

      // Reset form with new data
      form.reset(data);

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarValue || undefined} alt={form.watch("name") || "User"} />
          <AvatarFallback>
            <HugeiconsIcon icon={UserIcon} className="h-10 w-10 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-muted-foreground">
            Enter a URL for your profile picture. Recommended size: 200x200px
          </p>
        </div>
      </div>

      {/* Name Field */}
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            placeholder="Your name"
            {...form.register("name")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>Your display name (2-100 characters)</FieldDescription>
        <FieldError
          errors={form.formState.errors.name ? [form.formState.errors.name] : undefined}
        />
      </Field>

      {/* Email Field */}
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...form.register("email")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>Your email address for notifications and login</FieldDescription>
        <FieldError
          errors={form.formState.errors.email ? [form.formState.errors.email] : undefined}
        />
      </Field>

      {/* Avatar URL Field */}
      <Field>
        <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
        <FieldContent>
          <Input
            id="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            {...form.register("avatar")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>
          Link to your profile picture. Leave empty to remove your avatar.
        </FieldDescription>
        <FieldError
          errors={form.formState.errors.avatar ? [form.formState.errors.avatar] : undefined}
        />
      </Field>

      {/* Bio Field */}
      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <FieldContent>
          <Textarea
            id="bio"
            placeholder="Tell us a little about yourself..."
            rows={4}
            {...form.register("bio")}
            disabled={isLoading}
          />
        </FieldContent>
        <FieldDescription>A brief description about yourself (max 500 characters)</FieldDescription>
        <FieldError errors={form.formState.errors.bio ? [form.formState.errors.bio] : undefined} />
      </Field>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isLoading || !form.formState.isDirty}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
