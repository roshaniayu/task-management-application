import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { signInUser } from "../../lib/api";
import { saveAuth } from "../../lib/auth";

type LoginFormProps = {
  onSwitch?: () => void;
  onAuthSuccess: (token: string, username: string) => void;
};

export function LoginForm({ onSwitch, onAuthSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // disable default form submission

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await signInUser({
        username: formData.username,
        password: formData.password,
      });

      onAuthSuccess(response.token, response.username);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Sign In</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Let's get your tasks done!
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

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="text-primary p-0 h-auto"
            onClick={(e) => {
              e.preventDefault();
              onSwitch && onSwitch();
            }}
          >
            Register Now
          </Button>
        </p>
      </form>
    </Card>
  );
}