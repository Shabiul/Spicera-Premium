import { useEffect } from "react";
import { useLocation } from "wouter";
import { SignIn } from "@stackframe/stack";
import { useUser } from "@stackframe/stack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function Login() {
  const [, setLocation] = useLocation();
  const user = useUser();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <SignIn />
        </CardContent>
      </Card>
    </div>
  );
}