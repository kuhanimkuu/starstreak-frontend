import { useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';

const ChatLink = () => {
  const { id } = useParams();
  return <DeepLinkHandler type="chat" id={id} />;
};

export default ChatLink;
