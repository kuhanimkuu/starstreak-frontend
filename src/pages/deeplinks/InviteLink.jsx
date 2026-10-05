import { useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';

const InviteLink = () => {
  const { code } = useParams();
  return <DeepLinkHandler type="invite" id={code} />;
};

export default InviteLink;
