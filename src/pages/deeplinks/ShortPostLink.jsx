import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { PostPreview } from '../../components/LinkPreview';
import { previewPost } from '../../lib/previewPost';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// X-style post links: /<username>/<kind>/<shortId>. Only the number counts;
// the username is cosmetic ('anonymous' for anonymous posts).
const VIEWS = {
  post: 'posts_public',
  'community-post': 'community_discussions_public',
  'flash-post': 'flash_discussions_public',
};

function webAppPath(kind, row) {
  if (kind === 'post') return `/post/${row.id}`;
  if (kind === 'community-post') return `/communities/${row.community_id}/post/${row.id}`;
  return `/flashes/${row.community_id}/post/${row.id}`;
}

const ShortPostLink = ({ kind }) => {
  const { username, shortId } = useParams();
  const { user, authLoading } = useAuth();
  const [row, setRow] = useState(null);
  const valid = /^[A-Za-z0-9_.]{1,50}$/.test(username || '') && /^\d{6,12}$/.test(shortId || '');

  // Public posts are readable signed out (RLS hides private spaces), so
  // everyone gets the post itself, not just "someone shared a post".
  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    supabase
      .from(VIEWS[kind])
      .select('*')
      .eq('short_id', shortId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data && !data.is_deleted) setRow(data);
      });
    return () => {
      cancelled = true;
    };
  }, [valid, kind, shortId]);

  // Signed in on the web: open it in the web app.
  if (row && !authLoading && user) return <Navigate to={webAppPath(kind, row)} replace />;

  const post = row && previewPost(kind, row);
  const who = post && !post.is_anonymous ? post.author_name : null;
  return (
    <DeepLinkHandler
      type="post"
      preview={post && <PostPreview post={post} />}
      title={who ? `${who} on Starstreak` : 'Shared on Starstreak'}
    />
  );
};

export default ShortPostLink;
