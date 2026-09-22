import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        kicker="Welcome back"
        title="Log in"
        description="Use the email you signed up with. We will send you home if you already have a pair."
      />
      <Card className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <a href="/signup" className="font-semibold text-rose-deep">
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}
