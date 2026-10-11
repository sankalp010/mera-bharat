import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Compass, Heart, ImagePlus, Moon, Search, Send, Sun, Trash2, UsersRound, X } from 'lucide-react';
import { api, json } from './api';
import { useAuth } from './AuthContext';

const A = '/assets/';
const galleryImages = ['kedarnath.jpg', 'fort.jpg', 'fort1.jpg', 'goldentemple.jpg', 'hampi1.jpg', 'hawamahal.jpg', 'indiagate.jpg', 'tajmahal.jpg', 'lotus.jpg', 'tirupati.jpg', 'varanasi.jpg', 'adiyogi.jpg', 'bombay.jpg', 'qutub.jpg', 'gateway.jpg', 'Cover-for-Places-to-visit-in-Madhya-Pradesh-in-Summer.webp', 'RAJMACHI.jpg', 'Hampi.jpg', 'Shiva-Wallpaper-full-moon-night.jpg'];
const heroWords = ['story', 'chapter', 'legend', 'path', 'memory', 'lesson', 'meaning', 'witness'];
const heroImages = ['bg.jpg', 'bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'qutub.jpg', 'kedarnath.jpg', 'hampi1.jpg', 'hawamahal.jpg', 'bombay.jpg', 'tajmahal.jpg', 'goldentemple.jpg', 'nature.jpg'];

function Footer() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return <footer className="site-footer"><Link to="/" className="brand brand-light"><img src={`${A}mera.jpeg`} alt="" /><span>MERA <b>BHARAT</b></span></Link><p>Made for the stories that bring us closer.</p><div>{user ? <><Link to="/feed">Community</Link><Link to="/discover">Discover</Link><Link to={`/profile/${user.username}`}>Profile</Link><Link to="/notifications">Notifications</Link><button className="footer-action" onClick={async () => { await signOut(); navigate('/'); }}>Sign out</button></> : <><Link to="/login">Log in</Link><Link to="/signup">Join the journey</Link></>}<Link to="/contact">Contact</Link><Link to="/terms">Terms</Link><span>© {new Date().getFullYear()} MERA BHARAT</span><span className="footer-credit">Built with <Heart size={13} fill="currentColor" aria-label="love" /> by sankalP</span></div></footer>;
}

function AppFrame({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('mera-bharat-theme') === 'dark'; } catch { return false; } });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('mera-bharat-theme', dark ? 'dark' : 'light'); } catch {}
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    document.documentElement.classList.toggle('theme-spotlight', dark && finePointer);
    if (!dark || !finePointer) return undefined;
    const move = (event) => { document.documentElement.style.setProperty('--spot-x', `${event.clientX}px`); document.documentElement.style.setProperty('--spot-y', `${event.clientY}px`); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [dark]);
  const handleSignOut = async () => { await signOut(); navigate('/'); };
  return <><header className="app-topbar"><Link to="/" className="app-topbar-brand">MERA <b>BHARAT</b></Link><div className="app-topbar-actions">{user && <><Link to="/discover" className="app-topbar-link">Discover</Link><button className="app-topbar-link app-topbar-signout" onClick={handleSignOut}>Sign out</button></>}<button className="theme-toggle theme-toggle-floating" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} title={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>{children}<Footer /></>;
}
function RequireAuth({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="loading-screen"><span className="spinner" />Finding your way…</div>; return user ? children : <Navigate to="/login" replace />; }
function PublicOnly({ children }) { const { user, loading } = useAuth(); if (loading) return <div className="loading-screen"><span className="spinner" />Finding your way…</div>; return user ? <Navigate to="/feed" replace /> : children; }

function Landing() {
  const { user } = useAuth();
  const [wordIndex, setWordIndex] = useState(0);
  const [heroImage, setHeroImage] = useState(heroImages[0]);
  const displayedHeroImage = heroWords[wordIndex] === 'witness' ? 'varanasi.jpg' : heroImage;
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % heroWords.length);
      setHeroImage((current) => {
        const choices = heroImages.filter((image) => image !== current);
        return choices[Math.floor(Math.random() * choices.length)];
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);
  return <>
    <section className="hero" style={{ '--hero-image': `url("${A}${displayedHeroImage}")` }}><div className="hero-shade" /><div className="hero-content">
      <span className="eyebrow eyebrow-light">INDIA, THROUGH YOUR EYES</span><h1>Every journey<br />has a <em key={heroWords[wordIndex]} className="hero-word">{heroWords[wordIndex]}.</em></h1><p>Find your people, share the places that moved you, and see India through a thousand new perspectives.</p>
      <div className="hero-actions"><Link className="button button-cream" to={user ? '/feed' : '/signup'}>{user ? 'Open your community' : 'Start your journey'} <ArrowRight size={17} /></Link>{user && <Link className="hero-secondary" to="/discover">Discover <span>↗</span></Link>}</div>
      <div className="hero-caption"><span /> Stories from every corner of India</div>
    </div><div className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></div></section>
    <section className="intro section-pad"><div className="intro-heading"><span className="eyebrow">A LITTLE CLOSER TO HOME</span><h2>India is not just<br />a place to <em>visit.</em></h2></div><div className="intro-copy"><p>It’s the chai shared with a stranger, the road that wasn’t on the map, the quiet morning when the mountains felt close enough to touch.</p><p>MERA BHARAT is a community for travelers who believe the best way to know a place is through the people who call it home.</p><Link className="text-link" to="/discover">Get to know us <ArrowRight size={16} /></Link></div></section>
    <section className="destination-band"><div><span className="eyebrow eyebrow-light">THE JOURNEY IS YOURS</span><h2>From the first light<br />to the last train home.</h2><Link className="button button-cream" to="/discover">Wander through India <ArrowRight size={17} /></Link></div><div className="destination-image" style={{ backgroundImage: `url("${A}pexels-yogendra-singh-12912712.jpg")` }} /></section>
    <section className="features section-pad"><div className="section-title"><span className="eyebrow">MORE THAN A FEED</span><h2>Travel is better <em>together.</em></h2></div><div className="feature-grid"><Feature number="01" title="Share your stories" copy="A small moment, a big adventure, a photo you keep coming back to. Your journey belongs here." image="annie-spratt-WCgioEcEVNc-unsplash.jpg" /><Feature number="02" title="Find your people" copy="Meet travelers who know the back roads, the best breakfasts, and how to make a place feel like yours." image="ravi-n-jha-aU9yXmIwfkw-unsplash.jpg" /><Feature number="03" title="See it differently" copy="Discover a familiar country all over again, one personal story and unexpected detour at a time." image="kyran-low-MvkLKGtBcUA-unsplash.jpg" /></div></section>
    <section className="closing-cta"><span className="eyebrow eyebrow-light">YOUR INDIA IS WAITING</span><h2>Come as you are.<br /><em>Bring a story.</em></h2><Link className="button button-cream" to={user ? '/feed' : '/signup'}>{user ? 'Go to community' : 'Join MERA BHARAT'} <ArrowRight size={17} /></Link></section>
  </>;
}
function Feature({ number, title, copy, image }) { return <article className="feature-card"><div className="feature-photo" style={{ backgroundImage: `url("${A}${image}")` }}><span>{number}</span></div><h3>{title}</h3><p>{copy}</p></article>; }

function AuthPage({ mode }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'signup') {
        if (form.get('password') !== form.get('confirm')) throw new Error('Your passwords do not match.');
        await signUp({ name: form.get('name'), email: form.get('email'), username: form.get('username'), password: form.get('password'), acceptedTerms: form.get('terms') === 'on' });
      } else await signIn(form.get('username'), form.get('password'));
      navigate('/feed');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-page"><video className="auth-video" autoPlay muted loop playsInline aria-hidden="true"><source src={`${A}1740027379.mp4`} type="video/mp4" /></video><div className="auth-shade" /><div className="auth-card"><span className="eyebrow">{mode === 'signup' ? 'YOUR JOURNEY STARTS HERE' : 'WELCOME BACK'}</span><h1>{mode === 'signup' ? 'Join the journey.' : 'Come on in.'}</h1><p>{mode === 'signup' ? 'A community shaped by the places we go and the people we meet.' : 'Pick up where your last story left off.'}</p>
    <form onSubmit={submit} className="form-stack">{mode === 'signup' && <><label>Your name<input name="name" autoComplete="name" required minLength="2" maxLength="100" /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label></>}<label>Username<input name="username" autoComplete="username" required minLength={mode === 'signup' ? 3 : 1} maxLength="30" /></label><label>Password<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 8 : 1} maxLength="72" /></label>{mode === 'signup' && <><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required maxLength="72" /></label><label className="check-label"><input type="checkbox" name="terms" required /> I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link>.</label></>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-green form-submit" disabled={busy}>{busy ? 'One moment…' : mode === 'signup' ? 'Create your account' : 'Sign in'} <ArrowRight size={17} /></button></form>
    <p className="auth-switch">{mode === 'signup' ? 'Already have an account?' : 'New to MERA BHARAT?'} <Link to={mode === 'signup' ? '/login' : '/signup'}>{mode === 'signup' ? 'Log in' : 'Create an account'}</Link></p></div></main>;
}

function SectionHeading({ label, title, description }) { return <div className="page-heading"><span className="eyebrow">{label}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>; }
function Avatar({ person, size = '' }) { return person?.profileImage ? <img className={`avatar ${size}`} src={person.profileImage} alt={`${person.name}'s portrait`} /> : <div className={`avatar avatar-fallback ${size}`} aria-label={`${person?.name || 'Traveler'}'s portrait`}>{person?.name?.[0]?.toUpperCase() || 'M'}</div>; }
function PersonCard({ person, action, actionText, subtle = false }) { return <div className={`person-card ${subtle ? 'person-card-subtle' : ''}`}><Link to={`/profile/${person.username}`} className="person-identity"><Avatar person={person} /><span><b>{person.name}</b><small>@{person.username}</small></span></Link>{action && <button className="mini-button" onClick={action}>{actionText}</button>}</div>; }

function PostCard({ post, own = false, onDelete }) {
  const author = post.author || {};
  return <article className="post-card"><div className="post-top"><Link to={`/profile/${author.username}`} className="person-identity"><Avatar person={author} /><span><b>{author.name || 'Traveler'}</b><small>@{author.username}</small></span></Link><div className="post-meta"><time>{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>{own && <button className="icon-button delete-post" aria-label="Delete post" onClick={onDelete}><Trash2 size={17} /></button>}</div></div>{post.content && <p className="post-copy">{post.content}</p>}{post.image && <img className="post-image" src={post.image} alt="Travel moment shared by the author" />}</article>;
}

function CommunityAside({ user }) {
  const [friends, setFriends] = useState({ friends: [], incomingRequests: [], suggestions: [] }); const [error, setError] = useState('');
  const refresh = () => api('/friends').then(setFriends).catch((err) => setError(err.message));
  useEffect(() => { refresh(); }, []);
  const act = async (path, method = 'POST') => { try { await api(path, { method }); await refresh(); } catch (err) { setError(err.message); } };
  return <aside className="community-aside"><div className="aside-profile"><Avatar person={user} size="avatar-large" /><span className="eyebrow">YOUR TRAVEL JOURNAL</span><h3>{user.name}</h3><p>@{user.username}</p><Link to={`/profile/${user.username}`} className="text-link">View profile <ArrowRight size={15} /></Link></div>
    {friends.incomingRequests?.length > 0 && <div className="aside-block"><div className="aside-heading"><h3>Friend requests</h3><span>{friends.incomingRequests.length}</span></div>{friends.incomingRequests.slice(0, 3).map((request) => <PersonCard key={request.id} person={request.from} action={() => act(`/friends/requests/${request.from.id}/accept`)} actionText="Accept" subtle />)}</div>}
    <div className="aside-block"><div className="aside-heading"><h3>Your people</h3><Link to={`/profile/${user.username}`}>See all</Link></div>{friends.friends?.slice(0, 4).map((person) => <PersonCard key={person.id} person={person} subtle />)}{!friends.friends?.length && <p className="quiet-text">Your next travel friend is out there. Start with a search.</p>}</div>
    {friends.suggestions?.length > 0 && <div className="aside-block"><div className="aside-heading"><h3>Meet a traveler</h3></div>{friends.suggestions.slice(0, 3).map((person) => <PersonCard key={person.id} person={person} action={() => act(`/friends/requests/${person.id}`)} actionText="Add" subtle />)}</div>}
    {error && <p className="form-error">{error}</p>}
  </aside>;
}

function Feed() {
  const { user } = useAuth(); const [posts, setPosts] = useState([]); const [content, setContent] = useState(''); const [photo, setPhoto] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const refresh = () => api('/posts').then(({ posts: all }) => setPosts(all)).catch((err) => setError(err.message));
  useEffect(() => { refresh(); }, []);
  const publish = async (event) => { event.preventDefault(); const form = event.currentTarget; setError(''); setBusy(true); const data = new FormData(); data.set('content', content); if (photo) data.set('image', photo); try { await api('/posts', { method: 'POST', body: data }); setContent(''); setPhoto(null); form.reset(); await refresh(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const remove = async (id) => { if (!window.confirm('Delete this story?')) return; try { await api(`/posts/${id}`, { method: 'DELETE' }); setPosts(posts.filter((post) => post.id !== id)); } catch (err) { setError(err.message); } };
  return <main className="community-page"><div className="community-layout"><section className="feed-column"><div className="community-welcome"><span className="eyebrow">THE COMMUNITY JOURNAL</span><h1>Good to see you,<br /><em>{user.name.split(' ')[0]}.</em></h1><p>What did the road bring you today?</p></div><form className="composer" onSubmit={publish}><div className="composer-head"><Avatar person={user} /><textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength="4000" placeholder="Share a moment from your journey…" aria-label="Write a post" /></div>{photo && <div className="selected-photo">{photo.name}<button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"><X size={15} /></button></div>}<div className="composer-foot"><label className="photo-picker"><ImagePlus size={17} /><span>Add a photo</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setPhoto(e.target.files?.[0] || null)} /></label><button className="button button-green button-small" disabled={busy}>{busy ? 'Sharing…' : 'Share story'} <Send size={15} /></button></div>{error && <p className="form-error">{error}</p>}</form><div className="feed-heading"><h2>Stories from the road</h2><span>{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span></div><div className="post-list">{posts.map((post) => <PostCard key={post.id} post={post} own={post.author?.id === user.id} onDelete={() => remove(post.id)} />)}{!posts.length && <div className="empty-state"><span>✳</span><h3>The road is quiet for now.</h3><p>Share the first story and give someone a reason to wander.</p></div>}</div></section><CommunityAside user={user} /></div></main>;
}

function Profile() {
  const { username } = useParams(); const { user, setUser } = useAuth();
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [status, setStatus] = useState(''); const [location, setLocation] = useState(''); const [notice, setNotice] = useState('');
  const load = () => api(`/users/${encodeURIComponent(username)}`).then((result) => { setData(result); setStatus(result.profile.status || ''); setLocation(result.profile.location || ''); }).catch((err) => setError(err.message));
  useEffect(() => { load(); }, [username]);
  const update = async (event) => { event.preventDefault(); try { const result = await api('/users/me/profile', json('PATCH', { status, location })); setUser(result.user); setNotice('Your profile is up to date.'); load(); } catch (err) { setError(err.message); } };
  const upload = async (event) => { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.set('image', file); try { const result = await api('/users/me/avatar', { method: 'POST', body }); setUser(result.user); setNotice('Profile photo updated.'); load(); } catch (err) { setError(err.message); } };
  const act = async (path, method = 'POST') => { try { await api(path, { method }); await load(); } catch (err) { setError(err.message); } };
  if (!data && !error) return <div className="loading-screen"><span className="spinner" />Finding traveler…</div>;
  if (!data) return <main className="simple-page"><SectionHeading label="TRAVELER" title="We lost the trail." description={error} /><Link className="button button-green" to="/feed">Back to community</Link></main>;
  const { profile, posts, friends, relationship } = data; const isOwner = profile.id === user.id;
  return <main className="community-page"><div className="profile-layout"><section className="profile-main"><div className="profile-cover" style={{ backgroundImage: `url("${A}bg2.jpg")` }} /><div className="profile-overview"><Avatar person={profile} size="avatar-profile" />{isOwner && <label className="button button-light avatar-upload">Change photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} /></label>}<div className="profile-intro"><span className="eyebrow">TRAVELER PROFILE</span><h1>{profile.name}</h1><p className="profile-username">@{profile.username}</p><p>{profile.status || 'Collecting moments across India.'}</p>{profile.location && <p className="location-line"><MapPin size={16} />{profile.location}</p>}{!isOwner && <div className="profile-actions">{relationship === 'none' && <button className="button button-green" onClick={() => act(`/friends/requests/${profile.id}`)}>Send friend request <UsersRound size={16} /></button>}{relationship === 'sent' && <button className="button button-light" onClick={() => act(`/friends/requests/${profile.id}`, 'DELETE')}>Request sent · cancel</button>}{relationship === 'received' && <button className="button button-green" onClick={() => act(`/friends/requests/${profile.id}/accept`)}>Accept request <Check size={16} /></button>}{relationship === 'friends' && <button className="button button-light" onClick={() => act(`/friends/${profile.id}`, 'DELETE')}>Friends · remove</button>}</div>}</div></div>{isOwner && <form className="profile-edit" onSubmit={update}><h3>A little about you</h3><label>Your travel note<input value={status} onChange={(e) => setStatus(e.target.value)} maxLength="240" placeholder="What are you exploring lately?" /></label><label>Where you call home<input value={location} onChange={(e) => setLocation(e.target.value)} maxLength="100" placeholder="City, state" /></label><button className="button button-green button-small">Save profile</button>{notice && <span className="success-text">{notice}</span>}</form>}{error && <p className="form-error">{error}</p>}<div className="feed-heading"><h2>{isOwner ? 'Your travel journal' : `${profile.name.split(' ')[0]}'s stories`}</h2><span>{posts.length} stories</span></div><div className="post-list">{posts.map((post) => <PostCard key={post.id} post={post} own={isOwner} onDelete={() => act(`/posts/${post.id}`, 'DELETE')} />)}{!posts.length && <div className="empty-state"><span>✳</span><h3>No stories shared yet.</h3><p>The first one is always the hardest. Start when you’re ready.</p></div>}</div></section><aside className="profile-sidebar"><div className="aside-block"><div className="aside-heading"><h3>Travel companions</h3><span>{friends.length}</span></div>{friends.map((person) => <PersonCard key={person.id} person={person} subtle />)}{!friends.length && <p className="quiet-text">New connections will find their way here.</p>}</div></aside></div></main>;
}

function SearchPage() {
  const navigate = useNavigate(); const [params] = useState(new URLSearchParams(window.location.search)); const [term, setTerm] = useState(params.get('q') || ''); const [users, setUsers] = useState([]); const [error, setError] = useState('');
  const search = async (event) => { event?.preventDefault(); if (term.trim().length < 2) return; navigate(`/search?q=${encodeURIComponent(term.trim())}`, { replace: true }); try { const result = await api(`/users/search?q=${encodeURIComponent(term.trim())}`); setUsers(result.users); setError(''); } catch (err) { setError(err.message); } };
  useEffect(() => { if (term.trim().length > 1) search(); }, []);
  return <main className="simple-page"><SectionHeading label="FIND YOUR PEOPLE" title="Every great trip starts with a connection." description="Look for travelers by name or username." /><form className="large-search" onSubmit={search}><Search size={20} /><input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Try a name or username…" aria-label="Search by name or username" /><button className="button button-green button-small">Search</button></form>{error && <p className="form-error">{error}</p>}<div className="search-results">{users.map((person) => <PersonCard key={person.id} person={person} />)}{users.length === 0 && term.trim().length > 1 && !error && <div className="empty-state"><span>⌕</span><h3>No travelers found.</h3><p>Try another name or username.</p></div>}</div></main>;
}

function Notifications() {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api('/notifications').then(({ notifications }) => setItems(notifications)).catch((err) => setError(err.message)); }, []);
  const markRead = async (notification) => { if (notification.readAt) return; try { const { notification: updated } = await api(`/notifications/${notification.id}/read`, { method: 'PATCH' }); setItems(items.map((item) => item.id === updated.id ? updated : item)); } catch (err) { setError(err.message); } };
  return <main className="simple-page"><SectionHeading label="YOUR INBOX" title="Notes from your people." description="Friend requests, new connections, and little reminders that the journey is shared." />{error && <p className="form-error">{error}</p>}<div className="notification-list">{items.map((item) => <button key={item.id} className={`notification-card ${item.readAt ? '' : 'unread'}`} onClick={() => markRead(item)}><span className="notification-dot" /><span><b>{item.message}</b><small>{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small></span><Check size={17} /></button>)}{!items.length && !error && <div className="empty-state"><span>✳</span><h3>All quiet over here.</h3><p>Your new notes from the community will show up here.</p></div>}</div></main>;
}

const places = [
  { name: 'The Himalayan North', region: 'HIMACHAL · UTTARAKHAND', image: 'kedarnath.jpg', copy: 'Wake up above the clouds. Follow the footpaths, the prayer flags, and the first warm cup of chai.' },
  { name: 'Rajasthan in color', region: 'JAIPUR · JAISALMER', image: 'hawamahal.jpg', copy: 'Palace courtyards, desert evenings, and old city lanes that tell stories after the shops close.' },
  { name: 'A slower South', region: 'HAMPI · KARNATAKA', image: 'hampi1.jpg', copy: 'Ancient stone, open skies, coconut groves, and afternoons that ask you to stay a little longer.' },
  { name: 'The city by the sea', region: 'MUMBAI · MAHARASHTRA', image: 'bombay.jpg', copy: 'Catch the local, find a late-night snack, and let the city show you how it keeps moving.' },
  { name: 'Sacred mornings', region: 'VARANASI · UTTAR PRADESH', image: 'varanasi.jpg', copy: 'Begin before sunrise beside the river. Some places are best experienced in a quiet moment.' },
  { name: 'The long road west', region: 'KUTCH · GUJARAT', image: 'gateway.jpg', copy: 'Salt-white horizons, bright textiles, and a landscape that feels like another planet.' },
];
function Discover() {
  return <main className="discover-page">
    <section className="simple-page discover-explore"><SectionHeading label="TAKE THE SCENIC ROUTE" title="Where will the road take you?" description="From high mountain passes to the last local train, there is always another way to meet India." /><div className="places-grid">{places.map((place, index) => <article className="place-card" key={place.name}><div className="place-image"><img src={`${A}${place.image}`} alt={place.name} loading="lazy" /><span>0{index + 1}</span></div><span className="eyebrow">{place.region}</span><h2>{place.name}</h2><p>{place.copy}</p></article>)}</div></section>
    <section className="simple-page gallery-page discover-gallery"><SectionHeading label="A COUNTRY IN MANY COLORS" title="The places that stay with you." description="A little inspiration for your next long weekend, slow morning, or very scenic detour." /><div className="gallery-grid">{galleryImages.map((image, index) => <figure key={image} className={`gallery-tile gallery-tile-${index % 6}`}><img src={`${A}${encodeURIComponent(image)}`} alt={image.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')} loading="lazy" /><figcaption>{image.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}</figcaption></figure>)}</div></section>
    <section className="editorial-page discover-story"><section className="editorial-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(17,41,33,.88),rgba(17,41,33,.1)),url("${A}bg3.jpg")` }}><span className="eyebrow eyebrow-light">A NOTE FROM THE ROAD</span><h1>India is not a country.<br />It’s a <em>home.</em></h1></section><section className="editorial-copy"><div className="editorial-label-group"><span className="eyebrow">WHY WE’RE HERE</span><figure className="story-highlight"><img src={`${A}kedarnath.jpg`} alt="Kedarnath temple beneath the Himalayan peaks" loading="lazy" /><figcaption>Every road begins somewhere.</figcaption></figure></div><div className="editorial-content"><h2>We believe the best way to know a place is through the people who call it home.</h2><div className="editorial-body"><p>MERA BHARAT started with a simple thought: travel stories are better when they travel. The little local café you almost missed. The bus ride with the view nobody warned you about. The stranger who became a friend before the journey was over.</p><p>We made a place for those stories to find each other. A community for curious travelers, generous hosts, and anyone who knows that the journey is made of more than the destination.</p><p>Wherever you’re from, and wherever you’re going next, there’s room at this table.</p><Link className="button button-green" to="/signup">Find your people <ArrowRight size={17} /></Link></div><aside className="story-aside"><div className="explore-note"><Compass size={24} /><p>Some of the best places don’t make the guidebook. <Link to="/signup">Join the community</Link> to find them through the people who know.</p></div></aside></div></section></section>
  </main>;
}

function Contact() { const [sent, setSent] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); const formElement = event.currentTarget; setBusy(true); const form = new FormData(formElement); try { await api('/contact', json('POST', { name: form.get('name'), email: form.get('email'), message: form.get('message') })); setSent(true); formElement.reset(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <main className="contact-page"><section className="contact-intro"><span className="eyebrow eyebrow-light">WE’RE LISTENING</span><h1>Every good<br />journey starts<br />with <em>hello.</em></h1><p>Questions, ideas, kind words, or a story you think we should hear. Our inbox is open.</p></section><section className="contact-form-wrap"><span className="eyebrow">SEND A NOTE</span><h2>What’s on your mind?</h2>{sent ? <div className="success-panel"><Check size={22} /><div><b>Your note is on its way.</b><p>Thanks for taking the time to write to us.</p></div></div> : <form className="form-stack" onSubmit={submit}><label>Your name<input name="name" required minLength="2" maxLength="100" /></label><label>Email address<input name="email" type="email" required maxLength="254" /></label><label>Your message<textarea name="message" required minLength="10" maxLength="5000" rows="5" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-green" disabled={busy}>{busy ? 'Sending…' : 'Send your note'} <Send size={16} /></button></form>}</section></main>;
}

function Terms() { return <main className="simple-page terms-page"><SectionHeading label="THE SMALL PRINT" title="Terms and conditions." description="A few shared expectations help make MERA BHARAT a good place to be." /><article><h2>Using the community</h2><p>Use MERA BHARAT to share travel experiences, connect with other travelers, and discover places across India. You are responsible for the content you share and for keeping your account credentials private.</p><h2>Be thoughtful</h2><p>Be respectful of other members and the places discussed here. Do not post unlawful, abusive, misleading, or private information about another person. We may remove content or restrict accounts that put the community at risk.</p><h2>Your content</h2><p>You keep ownership of the stories and photographs you share. By posting, you allow MERA BHARAT to display that material within the service so other members can use the community as intended.</p><h2>Account and service</h2><p>You may update your profile or stop using the service at any time. MERA BHARAT is provided as a community project and may change as it grows. Contact us if you have a concern about your account or shared content.</p><h2>Contact</h2><p>Questions about these terms? <Link to="/contact">Send us a note.</Link></p></article></main>; }

export default function App() {
  return <AppFrame><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} /><Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} /><Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} /><Route path="/profile/:username" element={<RequireAuth><Profile /></RequireAuth>} /><Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} /><Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} /><Route path="/discover" element={<Discover />} /><Route path="/gallery" element={<Navigate to="/discover" replace />} /><Route path="/explore" element={<Navigate to="/discover" replace />} /><Route path="/about" element={<Navigate to="/discover" replace />} /><Route path="/contact" element={<Contact />} /><Route path="/terms" element={<Terms />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></AppFrame>;
}
