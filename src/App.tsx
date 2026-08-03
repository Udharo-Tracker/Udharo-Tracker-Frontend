import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/Dashboard/index";
import { CustomersList } from "./pages/customer/list";
import { CustomerDetail } from "./pages/customer/info";
import { UdharoList } from "./pages/udharo/list";
import { UdharoDetail } from "./pages/udharo/info";
import { PaymentsList } from "./pages/payment/list";
import { PaymentDetail } from "./pages/payment/info";
import { Reports } from "./pages/report/index";
import { Shops } from "./pages/shop/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/udharo" element={<UdharoList />} />
            <Route path="/udharo/:id" element={<UdharoDetail />} />
            <Route path="/payments" element={<PaymentsList />} />
            <Route path="/payments/:id" element={<PaymentDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/shop" element={<Shops />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
