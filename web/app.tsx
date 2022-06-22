import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { PrivateRoute, useAuth } from './lib/auth'
import ArchivePage from './pages/ArchivePage'
import ArchivesPage from './pages/ArchivesPage'
import FilesPage from './pages/FilesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import UploadPage from './pages/UploadPage'

const App = (): JSX.Element => {
  const auth = useAuth()

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute requireAdmin redirect>
              <HomePage />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/archives"
          element={
            <PrivateRoute requireAdmin redirect>
              <ArchivesPage />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/archives/:archiveId"
          element={
            <PrivateRoute requireAdmin redirect>
              <ArchivePage />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/files"
          element={
            <PrivateRoute requireAdmin redirect>
              <FilesPage />
            </PrivateRoute>
          }
        ></Route>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/upload"
          element={
            <PrivateRoute requireUpload redirect>
              <UploadPage />
            </PrivateRoute>
          }
        ></Route>
        <Route element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
export default App
