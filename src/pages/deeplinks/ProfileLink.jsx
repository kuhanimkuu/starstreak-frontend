import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { useAuth } from '../../context/AuthContext';

const ProfileLink = () => {
  const { username } = useParams();
  const { user, authLoading } = useAuth();
  // Signed in on the web: open the profile in the web app.
  if (!authLoading && user && /^[A-Za-z0-9_.]{1,30}$/.test(username || '')) {
    return <Navigate to={`/profile/${username}`} replace />;
  }
  return <DeepLinkHandler type="profile" id={username} />;
};

export default ProfileLink;
