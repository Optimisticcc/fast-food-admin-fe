import React from "react";
import { Redirect, Route } from "react-router-dom";

function ProtectedRoute({ component: Component, ...restOfProps }) {
  const isAuthenticated = localStorage.getItem("permision");
  console.log("this", isAuthenticated);

  return (
    <Route
      {...restOfProps}
      render={(props) =>
        isAuthenticated && isAuthenticated.includes("admin") ? (
          <Component {...props} />
        ) : (
          (window.alert("You do not have permision")
        ))
      }
    />
  );
}

export default ProtectedRoute;
