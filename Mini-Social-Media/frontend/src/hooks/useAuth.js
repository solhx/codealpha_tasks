//frontend/src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { logout, fetchCurrentUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user, isAuthenticated, loading, token } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const refreshUser = () => dispatch(fetchCurrentUser());

  const isOwner = (resourceUserId) =>
    user?._id?.toString() === resourceUserId?.toString();

  const isAdmin = user?.role === 'admin';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    isAdmin,
    isOwner,
    handleLogout,
    refreshUser,
  };
};

export default useAuth;