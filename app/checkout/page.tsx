import CheckoutPage from "@/components/checkout-page"
import AuthWrapper from "@/components/auth-wrapper"
import LoginPage from "@/components/login"

export default function Checkout() {
  return <AuthWrapper children={<CheckoutPage />} fallback={<LoginPage/>} />;
}