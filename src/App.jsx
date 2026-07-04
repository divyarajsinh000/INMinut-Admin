import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewsList from "./pages/NewsList";
import AddNews from "./pages/AddNews";
import EditNews from "./pages/EditNews";
import CategoryList from "./pages/CategoryList";
import AddCategory from "./pages/AddCategory";
import EditCategory from "./pages/EditCategory";
import Users from "./pages/Users";
import GuestUsers from "./pages/GuestUsers";
import Locations from "./pages/Locations";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import AdvertisementList from "./pages/AdvertisementList";
import Analytics from "./pages/Analytics";
import AddAdvertisement from "./pages/AddAdvertisement";
import EditAdvertisement from "./pages/EditAdvertisement";
import EmbedList from "./pages/EmbedList";
import AddEmbed from "./pages/AddEmbed";
import EditEmbed from "./pages/EditEmbed";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["super-admin", "editor"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <NewsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute roles={["super-admin", "editor"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/news/add"
            element={
              <ProtectedRoute>
                <AddNews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/news/edit/:id"
            element={
              <ProtectedRoute>
                <EditNews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <CategoryList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories/add"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <AddCategory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories/edit/:id"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <EditCategory />
              </ProtectedRoute>
            }
          />



          <Route
            path="/locations"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <Locations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />


          <Route
            path="/guest-users"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <GuestUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/add"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <AddUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <EditUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/advertisements"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <AdvertisementList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/advertisements/add"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <AddAdvertisement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/advertisements/edit/:id"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <EditAdvertisement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/embeds"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <EmbedList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/embeds/add"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <AddEmbed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/embeds/edit/:id"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <EditEmbed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={["super-admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}

export default App;
