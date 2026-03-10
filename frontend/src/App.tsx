import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LibraryPage } from '@/features/library/LibraryPage'
import { LocationSetupPage } from '@/features/location-setup/LocationSetupPage'
import { ToolSetupPage } from '@/features/tool-setup/ToolSetupPage'
import { ToolPlacementPage } from '@/features/tool-placement/ToolPlacementPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LibraryPage />} />
          <Route path="location-setup" element={<LocationSetupPage />} />
          <Route path="tool-setup" element={<ToolSetupPage />} />
          <Route path="tool-placement" element={<ToolPlacementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
