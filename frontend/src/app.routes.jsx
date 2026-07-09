import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Register from "./features/auth/pages/register";
import Login from "./features/auth/pages/login";
import ProtectedRoute from "./features/auth/components/protected";
import Home from "./features/interview/pages/home";
import Interview from "./features/interview/pages/interview";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/app",
        element: <ProtectedRoute><Home /></ProtectedRoute>
    },
    {
        path: "/interview/:interviewId",
        element: <ProtectedRoute><Interview /></ProtectedRoute>
    }
])
