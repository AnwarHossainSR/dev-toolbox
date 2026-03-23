import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent a confirmation link to your email address. Click the
          link to verify your account and get started with Dev Toolbox.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6 border border-border">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Check your inbox and spam folder</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            &apos;t receive the email? Check your spam folder or try signing up
            again.
          </p>
          <Button
            variant="outline"
            className="w-full border-input hover:bg-muted"
            asChild
          >
            <Link href="/auth/sign-up">Try Again</Link>
          </Button>
        </div>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Already confirmed your email?
        </p>
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 font-semibold h-11"
          asChild
        >
          <Link href="/auth/login">
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

