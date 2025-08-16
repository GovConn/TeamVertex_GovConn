import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch } from "@/hooks/redux";
import { login } from "@/store/authSlice";
import { loginGov } from "@/api/gov";

export function Login() {
  const [formData, setFormData] = useState({
    officeId: "",
    password: "",
    captcha: false,
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //api have been moved to /api
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.officeId || !formData.password || !formData.captcha) return;

    try {
      const { data } = await loginGov({
        username: formData.officeId,
        password: formData.password,
      });

      dispatch(
        login({
          id: data.id,
          username: data.username,
          role: data.role,
          email: data.email,
          location: data.location,
          category_id: data.category_id,
          created_at: data.created_at,
          name_en: data.name_en,
          name_si: data.name_si,
          name_ta: data.name_ta,
          description_en: data.description_en,
          description_si: data.description_si,
          description_ta: data.description_ta,
          access_token: data.access_token,
          token_type: data.token_type,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      window.alert("Login failed. Please try again.");
    }
  };
  //api section over

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.officeId && formData.password && formData.captcha;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 max-[425px]:h-8" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Admin Portal Login
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access the government portal
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="officeId"
                className="text-sm font-medium text-foreground"
              >
                Office ID
              </Label>
              <Input
                id="officeId"
                type="text"
                placeholder="Enter office ID"
                value={formData.officeId}
                onChange={(e) => handleInputChange("officeId", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center  space-x-2">
              <Checkbox
                id="captcha"
                checked={formData.captcha}
                onCheckedChange={(checked) =>
                  handleInputChange("captcha", !!checked)
                }
              />
              <Label
                htmlFor="captcha"
                className="text-sm text-foreground cursor-pointer py-6"
              >
                I'm not a robot
              </Label>
            </div>

            <Button
              variant="government"
              type="submit"
              className="w-full"
              disabled={!isFormValid}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
