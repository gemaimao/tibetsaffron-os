export function visibleAnnouncements(items, now = new Date()) {
  return items.filter(item => item.status === 'approved' && item.visibility === 'public' && item.id && item.title && Number.isFinite(Date.parse(item.published_at)) && Date.parse(item.published_at) <= now.getTime() && (!item.expires_at || (Number.isFinite(Date.parse(item.expires_at)) && Date.parse(item.expires_at) > now.getTime())));
}

export function publicReleaseIssues(content) {
  const issues = [];
  if (content.release_status !== 'approved' || !content.approved_by) issues.push('缺少整版公开批准');
  for (const media of content.media || []) {
    if (!['licensed','approved'].includes(media.rights_status)) issues.push(`影像待授权: ${media.id}`);
  }
  for (const evidence of content.evidence || []) {
    if (evidence.status !== 'approved') issues.push(`证据待核验: ${evidence.id}`);
  }
  for (const item of content.pending || []) issues.push(`内容待核验: ${item.id}`);
  return issues;
}
