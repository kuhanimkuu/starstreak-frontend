// Shared-link previews (components/LinkPreview) take the feed post shape.

/** Maps a posts_public / community_discussions_public / flash_discussions_public row. */
export function previewPost(kind, row) {
  if (kind === "community-post") {
    const docs = (row.document_urls || []).map(
      (u) => `doc::${decodeURIComponent(u.split("/").pop()?.split("?")[0] || "Document")}::${u}`,
    );
    return {
      ...row,
      media_urls: [...(row.image_urls || []), ...(row.video_urls || []), ...docs],
      likes: row.liked_by || [],
      dislikes: row.disliked_by || [],
      poll: row.poll_data || null,
    };
  }
  // Feed posts made as a community or Flash show that space as the author.
  if (row.posted_as_kind && row.posted_as_name) {
    return {
      ...row,
      author_name: row.posted_as_name,
      author_avatar_url: row.posted_as_avatar_url,
      author_username: null,
      is_verified: false,
    };
  }
  return row;
}
