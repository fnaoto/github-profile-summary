const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en').format(value || 0);
}

function truncate(value, maxLength) {
  const text = value || '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function createCard(user, repos) {
  const totalStars = repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
  const languageCounts = new Map();

  for (const repo of repos) {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
    }
  }

  const languages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([language]) => language);

  const repositoryRows = repos.slice(0, 3).map((repo, index) => {
    const y = 266 + index * 31;
    return `
      <text x="42" y="${y}" fill="#f1f5f9" font-size="15" font-weight="600">${escapeXml(
        truncate(repo.name, 32)
      )}</text>
      <text x="758" y="${y}" fill="#a5b4c8" font-size="14" text-anchor="end">* ${formatNumber(
        repo.stargazers_count
      )}</text>`;
  });

  const languageText = languages.length ? languages.join(' | ') : 'No language data yet';
  const name = truncate(user.name || user.login, 40);
  const bio = truncate(user.bio || 'Explore this GitHub profile and its recent repositories.', 78);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="390" viewBox="0 0 800 390" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(name)} (@${escapeXml(user.login)}) - GitHub Profile Summary</title>
  <desc id="description">${escapeXml(bio)}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10243a"/>
      <stop offset="1" stop-color="#081421"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7dd3fc"/>
      <stop offset="1" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="798" height="388" rx="24" fill="url(#background)" stroke="#294258" stroke-width="2"/>
  <rect x="32" y="30" width="4" height="43" rx="2" fill="url(#accent)"/>
  <text x="50" y="45" fill="#7dd3fc" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="2">GITHUB PROFILE</text>
  <text x="50" y="75" fill="#f1f5f9" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700">${escapeXml(
    name
  )}</text>
  <text x="50" y="99" fill="#7dd3fc" font-family="Arial, Helvetica, sans-serif" font-size="15">@${escapeXml(
    user.login
  )}</text>
  <text x="50" y="126" fill="#b5c5d8" font-family="Arial, Helvetica, sans-serif" font-size="14">${escapeXml(
    bio
  )}</text>
  <g font-family="Arial, Helvetica, sans-serif">
    <rect x="32" y="148" width="174" height="64" rx="13" fill="#14283b" stroke="#294258"/>
    <rect x="218" y="148" width="174" height="64" rx="13" fill="#14283b" stroke="#294258"/>
    <rect x="404" y="148" width="174" height="64" rx="13" fill="#14283b" stroke="#294258"/>
    <rect x="590" y="148" width="178" height="64" rx="13" fill="#14283b" stroke="#294258"/>
    <text x="48" y="173" fill="#9fb4c9" font-size="12">PUBLIC REPOSITORIES</text>
    <text x="48" y="199" fill="#f1f5f9" font-size="21" font-weight="700">${formatNumber(
      user.public_repos
    )}</text>
    <text x="234" y="173" fill="#9fb4c9" font-size="12">FOLLOWERS</text>
    <text x="234" y="199" fill="#f1f5f9" font-size="21" font-weight="700">${formatNumber(
      user.followers
    )}</text>
    <text x="420" y="173" fill="#9fb4c9" font-size="12">FOLLOWING</text>
    <text x="420" y="199" fill="#f1f5f9" font-size="21" font-weight="700">${formatNumber(
      user.following
    )}</text>
    <text x="606" y="173" fill="#9fb4c9" font-size="12">RECENT REPO STARS</text>
    <text x="606" y="199" fill="#f1f5f9" font-size="21" font-weight="700">${formatNumber(
      totalStars
    )}</text>
  </g>
  <text x="42" y="245" fill="#7dd3fc" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1">RECENT REPOSITORIES</text>
  ${repositoryRows.join('')}
  <line x1="32" y1="355" x2="768" y2="355" stroke="#294258"/>
  <text x="42" y="378" fill="#a5b4c8" font-family="Arial, Helvetica, sans-serif" font-size="13">Top languages: ${escapeXml(
    languageText
  )}</text>
  <text x="758" y="378" fill="#7dd3fc" font-family="Arial, Helvetica, sans-serif" font-size="13" text-anchor="end">Open live profile -&gt;</text>
</svg>`;
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Method not allowed');
  }

  const requestedUsername = request.query.username;
  const username = Array.isArray(requestedUsername)
    ? requestedUsername[0]
    : requestedUsername || 'fnaoto';
  if (!username || !GITHUB_USERNAME_PATTERN.test(username)) {
    return response.status(400).send('Invalid GitHub username');
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-profile-summary-app',
  };
  const encodedUsername = encodeURIComponent(username);

  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${encodedUsername}`, { headers }),
      fetch(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, {
        headers,
      }),
    ]);

    if (!userResponse.ok) {
      return response
        .status(userResponse.status === 404 ? 404 : 502)
        .send(userResponse.status === 404 ? 'GitHub user not found' : 'GitHub API request failed');
    }
    if (!reposResponse.ok) {
      return response.status(502).send('GitHub repositories could not be loaded');
    }

    const [user, repos] = await Promise.all([userResponse.json(), reposResponse.json()]);
    response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).send(createCard(user, repos));
  } catch (error) {
    console.error('Failed to generate profile card:', error);
    return response.status(502).send('Could not generate GitHub profile card');
  }
}
