import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

type RegisterFormProps = {
  onSwitch?: () => void;
};

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add registration logic here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Create an Account</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your information to get started
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-left block">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            required
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-left block">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-left block">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-left block">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Button
            variant="link"
            className="text-primary p-0 h-auto"
            onClick={(e) => {
              e.preventDefault();
              onSwitch && onSwitch();
            }}
          >
            Sign In
          </Button>
        </p>
      </form>
    </Card>
  );
}