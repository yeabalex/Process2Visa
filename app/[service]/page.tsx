import { StudentDashboard } from "@/components/student-dashboard";
import AuthWrapper from "@/components/auth-wrapper";
import LoginPage from "@/components/login";
import { PurchaseWrapper } from "@/components/purchase-wrapper";

export default function ServicePage() {
  return (
    <AuthWrapper
      children={
        <PurchaseWrapper>
          <StudentDashboard />
        </PurchaseWrapper>
      }
      fallback={<LoginPage/>}
    />
  );
}


