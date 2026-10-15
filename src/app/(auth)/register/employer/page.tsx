import type { Metadata } from "next";
import { EmployerRegisterForm } from "./EmployerRegisterForm";

export const metadata: Metadata = { title: "Employer registration" };

export default function EmployerRegisterPage() {
  return <EmployerRegisterForm />;
}
