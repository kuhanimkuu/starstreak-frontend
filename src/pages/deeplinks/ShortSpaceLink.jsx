import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import DeepLinkHandler from '../../components/DeepLinkHandler';
import { SpacePreview } from '../../components/LinkPreview';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Short community / Flash links: /community/<shortId>, /flash/<shortId>.
const TABLES = { community: 'communities', flash: 'flash_communities' };
const COLUMNS = {
  community: 'id, name, description, category, image_url, cover_image_url, hero_image_url, member_count, verification_status',
  flash: 'id, name, description, category, image_url, cover_image_url, member_count',
};

const ShortSpaceLink = ({ kind }) => {
  const { shortId } = useParams();
  const { user, authLoading } = useAuth();
  const [space, setSpace] = useState(null);
  const valid = /^\d{6,12}$/.test(shortId || '');

  // Readable signed out when public (RLS), so show what's being shared.
  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    supabase
      .from(TABLES[kind])
      .select(COLUMNS[kind])
      .eq('short_id', shortId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setSpace(data);
      });
    return () => {
      cancelled = true;
    };
  }, [valid, kind, shortId]);

  // Signed in on the web: open it in the web app.
  if (space && !authLoading && user) {
    return <Navigate to={kind === 'flash' ? `/flashes/${space.id}` : `/communities/${space.id}`} replace />;
  }

  return (
    <DeepLinkHandler
      type="community"
      preview={space && <SpacePreview space={space} kind={kind} />}
      title={space ? `Join ${space.name} on Starstreak` : null}
    />
  );
};

export default ShortSpaceLink;
