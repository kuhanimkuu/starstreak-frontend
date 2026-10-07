import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { useAuth } from '../../context/AuthContext';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CommunityLink = () => {
  const { id, subId } = useParams();
  const { user, authLoading } = useAuth();
  // Signed in on the web: open the community (or sub-community) in the web app.
  const target = subId || id;
  if (!authLoading && user && UUID.test(target || '')) return <Navigate to={`/communities/${target}`} replace />;
  return <DeepLinkHandler type="community" id={id} />;
};

export default CommunityLink;
