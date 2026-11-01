const searchForm = document.getElementById('search-form');
const usernameInput = document.getElementById('username');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const profileSection = document.getElementById('profile');
const avatar = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const handleEl = document.getElementById('handle');
const bioEl = document.getElementById('bio');
const githubLink = document.getElementById('github-link');
const reposEl = document.getElementById('repos');
const languagesEl = document.getElementById('languages');

const defaultUsername = 'fnaoto';

function updateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username') || defaultUsername;
  usernameInput.value = username;
  loadProfile(username);
}

function showError(message) {
  errorPanel.classList.remove('hidden');
  errorMessage.textContent = message;
  profileSection.classList.add('hidden');
}

function hideError() {
  errorPanel.classList.add('hidden');
  errorMessage.textContent = '';
}

function renderLanguages(languages) {
  if (!languages.length) {
    languagesEl.innerHTML = '<span class="muted">No language data available yet.</span>';
    return;
  }

  languagesEl.innerHTML = languages
    .map((language) => `<span class="chip">${language}</span>`)
    .join('');
}

function renderRepos(repos) {
  if (!repos.length) {
    reposEl.innerHTML = '<p class="muted">No public repositories found.</p>';
    return;
  }

  reposEl.innerHTML = repos
    .map(
      (repo) => `
        <a href="${repo.html_url}" target="_blank" rel="noreferrer" class="repo-card">
          <div class="repo-title-row">
            <h4>${repo.name}</h4>
            <span>★ ${repo.stargazers_count}</span>
          </div>
          <p>${repo.description || 'No description available.'}</p>
          <div class="repo-meta">
            <span>${repo.language || 'Unspecified'}</span>
            <span>Forks ${repo.forks_count}</span>
          </div>
        </a>
      `
    )
    .join('');
}

async function loadProfile(username) {
  try {
    hideError();
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);

    if (!response.ok) {
      throw new Error('GitHub user not found. Please try another username.');
    }

    const user = await response.json();
    const repoResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=6&sort=updated`
    );

    if (!repoResponse.ok) {
      throw new Error('GitHub repositories could not be loaded.');
    }

    const repos = await repoResponse.json();
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const languages = [...new Set(repos.map((repo) => repo.language).filter(Boolean))];

    avatar.src = user.avatar_url;
    avatar.alt = user.login;
    nameEl.textContent = user.name || user.login;
    handleEl.textContent = `@${user.login}`;
    bioEl.textContent = user.bio || 'No bio provided yet.';
    githubLink.href = user.html_url;

    document.getElementById('public-repos').textContent = user.public_repos;
    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
    document.getElementById('total-stars').textContent = totalStars;

    renderLanguages(languages);
    renderRepos(repos);

    profileSection.classList.remove('hidden');

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('username', username);
    window.history.replaceState({}, '', nextUrl);
  } catch (error) {
    showError(error.message || 'Something went wrong while loading the profile.');
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim() || defaultUsername;
  loadProfile(username);
});

updateFromUrl();
