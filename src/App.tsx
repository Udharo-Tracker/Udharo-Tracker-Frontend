import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/shared/AppLayout";
import { Dashboard } from "./pages/Dashboard/index";
import { CustomersList } from "./pages/customer/customers";
import { CustomerDetail } from "./pages/customer/customer";
import { AddUdharo } from "./pages/udharo/index";
import { RecordPayment } from "./pages/payment/index";
import { Reports } from "./pages/report/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/udharo/new" element={<AddUdharo />} />
          <Route path="/payments/new" element={<RecordPayment />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
