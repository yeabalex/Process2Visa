'use client'

import AuthWrapper from "@/components/auth-wrapper"
import LoginPage from "@/components/login"
import PurchasedServicesWrapper from "@/components/PurchasedServicesWrapper";

export default function Home() {
  return  <AuthWrapper children={<PurchasedServicesWrapper />} fallback={<LoginPage/>} />;
}
