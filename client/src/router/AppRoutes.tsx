import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import AppLayout from "@/components/layout/app-layout.tsx"
import AppLoadingScreen from "@/components/app-loading-screen.tsx"
import NotFoundPage from "@/pages/not-found/not-found-page.tsx"

const OverviewPage = lazy(() => import("@/pages/overview/overview-page.tsx"))
const EmployeesPage = lazy(() => import("@/pages/emloyees/employees-page.tsx"))

export default function AppRoutes() {
  return (
    <Suspense
      fallback={<AppLoadingScreen />}
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
