import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/shared/AppLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/Dashboard/index";
import { CustomersList } from "./pages/customer/customers";
import { CustomerDetail } from "./pages/customer/customer";
import { AddUdharo } from "./pages/udharo/index";
import { RecordPayment } from "./pages/payment/index";
import { Reports } from "./pages/report/index";
import { Shops } from "./pages/shop/index";
import { Reminders } from "./pages/reminder/index";

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
            <Route path="/customers/:id/reminders" element={<Reminders />} />
            <Route path="/udharo/new" element={<AddUdharo />} />
            <Route path="/payments/new" element={<RecordPayment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/shop" element={<Shops />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
