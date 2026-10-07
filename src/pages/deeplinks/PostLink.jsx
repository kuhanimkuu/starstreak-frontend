import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { useAuth } from '../../context/AuthContext';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PostLink = () => {
  const { id } = useParams();
  const { user, authLoading } = useAuth();
  // Signed in on the web: open the post in the web app.
  if (!authLoading && user && UUID.test(id || '')) return <Navigate to={`/post/${id}`} replace />;
  return <DeepLinkHandler type="post" id={id} />;
};

export default PostLink;
