import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"

import AppLayout from "@/components/layout/app-layout.tsx"
import NotFoundPage from "@/pages/not-found/not-found-page.tsx"

const OverviewPage = lazy(() => import("@/pages/overview/overview-page.tsx"))
const EmployeesPage = lazy(() => import("@/pages/emloyees/employees-page.tsx"))

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-svh items-center justify-center text-sm text-muted-foreground"
          role="status"
        >
          Loading page...
        </div>
      }
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
