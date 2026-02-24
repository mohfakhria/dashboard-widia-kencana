import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In Page | Dashboard Widia Kencana",
  description: "Sign In to Access the PT. Widia Kencana Dashboard Platform.",
};

export default function SignIn() {
  return <SignInForm />;
}
