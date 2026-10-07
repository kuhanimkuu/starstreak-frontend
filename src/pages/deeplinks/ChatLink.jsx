import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { useAuth } from '../../context/AuthContext';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ChatLink = () => {
  const { id } = useParams();
  const { user, authLoading } = useAuth();
  // Signed in on the web: open the chat in the web app (participants only).
  if (!authLoading && user && UUID.test(id || '')) return <Navigate to={`/messages/${id}`} replace />;
  return <DeepLinkHandler type="chat" id={id} />;
};

export default ChatLink;
