import { profile } from '../content/profile';

export default function ProfileTerminal() {
  return (
    <aside className="profile-terminal" aria-labelledby="terminal-title">
      <div className="profile-terminal__titlebar">
        <span className="profile-terminal__indicator" aria-hidden="true">›_</span>
        <span id="terminal-title">profile.toml</span>
        <span className="profile-terminal__mode">Read only</span>
      </div>
      <pre className="profile-terminal__code"><code>
        <span className="profile-terminal__comment"># identity / static profile</span>{'\n\n'}
        <span className="profile-terminal__group">[profile]</span>{'\n'}
        {profile.name.publish && <>{'name = '}<span className="profile-terminal__value">{JSON.stringify(profile.name.text)}</span>{'\n'}</>}
        {profile.positioning.publish && <>{'target = '}<span className="profile-terminal__value">{JSON.stringify(profile.positioning.text)}</span>{'\n'}</>}
        {'\n'}<span className="profile-terminal__group">[project_coverage]</span>{'\nareas = [\n'}
        {profile.expertise.filter(item => item.publish).map(item => (
          <span key={item.id}>{'  '}<span className="profile-terminal__value">{JSON.stringify(item.category)}</span>{',\n'}</span>
        ))}
        {']'}
      </code></pre>
    </aside>
  );
}
