import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const isSuperuser = localStorage.getItem('is_superuser') === 'true';

  if (!isSuperuser) {
    console.warn("Unauthorized access attempt to Admin Console.");
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
