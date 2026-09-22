import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        kicker="Join Twofold"
        title="Create an account"
        description="A name, an email, and a password. We will make your profile and send you to pairing next."
      />
      <Card className="space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-muted">
          Already have a key?{" "}
          <a href="/login" className="font-semibold text-rose-deep">
            Log in
          </a>
        </p>
      </Card>
    </div>
  );
}
