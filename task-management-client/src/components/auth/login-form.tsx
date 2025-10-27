import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { signInUser } from "../../lib/api";
import { Eye, EyeOff } from "lucide-react";

type LoginFormProps = {
  onSwitch?: () => void;
  onAuthSuccess: (token: string, username: string) => void;
};

export function LoginForm({ onSwitch, onAuthSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // disable default form submission

    setError(undefined);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await signInUser({
        username: formData.username,
        password: formData.password,
      });

      onAuthSuccess(response.token, response.username);
    } catch (error: any) {
      if (error.status === 400) {
        const errorFields = error.errorFields || {};

        const newErrors: { username?: string; password?: string } = {};
        if (errorFields.username) {
          newErrors.username = errorFields.username;
        }
        if (errorFields.password) {
          newErrors.password = errorFields.password;
        }

        setFieldErrors(newErrors);
      }

      setError(error.status === 400 ? "" : error.message || "Failed to sign in");
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
          <div className="relative">
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className={fieldErrors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
            />

            {fieldErrors.username && (
              <p className="mt-0.5 text-xs text-red-500 dark:text-red-400 text-left">{fieldErrors.username}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-left block">
            Password
          </label>
          <div className="relative">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""} />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>

            {fieldErrors.password && (
              <p className="mt-0.5 text-xs text-red-500 dark:text-red-400 text-left">{fieldErrors.password}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-0.5 text-sm text-red-500 dark:text-red-400">{error}</p>
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