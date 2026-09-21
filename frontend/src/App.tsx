import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { DoctorDashboard } from "@/pages/DoctorDashboard";
import { ReceptionDashboard } from "@/pages/ReceptionDashboard";
import { Prescriptions } from "@/pages/Prescriptions";
import { CreatePrescription } from "@/pages/CreatePrescription";
import { Medicines } from "@/pages/Medicines";
import { Patients } from "@/pages/Patients";
import { PatientProfile } from "@/pages/PatientProfile";
import { Appointments } from "@/pages/Appointments";
import { QueuePage } from "@/pages/QueuePage";
import { Consultation } from "@/pages/Consultation";
import { Billing } from "@/pages/Billing";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Landing } from "@/pages/Landing";
import { AuthPage } from "@/pages/Auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage />} />

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="reception" element={<ReceptionDashboard />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="prescriptions/new" element={<CreatePrescription />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="consultation/:id" element={<Consultation />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
