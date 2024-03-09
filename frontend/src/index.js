import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./styles.css";
import App from "./App";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import User from "./components/User";
import UserChat from "./components/UserChat";
import SinglePostPage from "./components/SinglePostPage";
import Group from "./components/Group";
import GroupChat from "./components/GroupChat";
import AllGroups from "./components/AllGroups";
import ErrorPage from "./components/ErrorPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            { path: "/register", element: <Register /> },
            { path: "/login", element: <Login /> },
            { path: "/user/:userId", element: <User /> },
            { path: "/chat/user/:userId", element: <UserChat /> },
            { path: "/post/:postId", element: <SinglePostPage /> },
            { path: "/group/:groupId", element: <Group /> },
            { path: "/chat/group/:groupId", element: <GroupChat /> },
            { path: "/groups", element: <AllGroups /> },
        ],
    },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
