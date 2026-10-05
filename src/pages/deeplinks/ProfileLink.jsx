import { useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';

const ProfileLink = () => {
  const { username } = useParams();
  return <DeepLinkHandler type="profile" id={username} />;
};

export default ProfileLink;
