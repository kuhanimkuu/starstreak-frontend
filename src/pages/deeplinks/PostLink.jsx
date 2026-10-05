import { useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';

const PostLink = () => {
  const { id } = useParams();
  return <DeepLinkHandler type="post" id={id} />;
};

export default PostLink;
