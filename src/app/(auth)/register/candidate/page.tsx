import type { Metadata } from "next";
import { CandidateRegisterForm } from "./CandidateRegisterForm";

export const metadata: Metadata = { title: "Candidate registration" };

export default function CandidateRegisterPage() {
  return <CandidateRegisterForm />;
}
