import { Suspense } from "react"
import RegistrationPage from "@/components/registration"

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationPage />
    </Suspense>
  )
}
