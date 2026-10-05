import { useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';

const CommunityLink = () => {
  const { id } = useParams();
  return <DeepLinkHandler type="community" id={id} />;
};

export default CommunityLink;
