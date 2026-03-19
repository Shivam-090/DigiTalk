import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import AddFriendsPage from "./pages/AddFriendsPage.jsx";
import BlockedUsersPage from "./pages/BlockedUsersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminLayout from "./admin/components/AdminLayout.jsx";
import ManageUsersPage from "./admin/pages/ManageUsersPage.jsx";
import ViewReportsPage from "./admin/pages/ViewReportsPage.jsx";
import Layout from "./components/Layout.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { theme } = useThemeStore();
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  const isAdmin = Boolean(authUser?.isAdmin);

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/signup"
          element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isAdmin ? "/admin/manage-users" : isOnboarded ? "/" : "/onboarding"} />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to={isAdmin ? "/admin/manage-users" : isOnboarded ? "/" : "/onboarding"} />}
        />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to={isAdmin ? "/admin/manage-users" : isOnboarded ? "/" : "/onboarding"} />}
        />

        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={true}>
                  <NotificationPage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/add-friends"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={true}>
                  <AddFriendsPage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={true}>
                  <ProfilePage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/blocked-users"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={true}>
                  <BlockedUsersPage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? <Navigate to="/admin/manage-users" /> : <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              isAdmin ? (
                <Navigate to="/admin/manage-users" />
              ) : (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              )
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              isAdmin ? <Navigate to="/admin/manage-users" /> : !isOnboarded ? <OnboardingPage /> : <Navigate to="/" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? <AdminLayout /> : <Navigate to={!isAuthenticated ? "/login" : "/"} />
          }
        >
          <Route index element={<Navigate to="/admin/manage-users" replace />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="view-reports" element={<ViewReportsPage />} />
        </Route>
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
