import type { ReactNode } from 'react';
import { profile } from '../content/profile';

export default function ProfileTerminal() {
  const value = (text: string) => <span className="profile-terminal__value">{JSON.stringify(text)}</span>;
  const group = (text: string) => <span className="profile-terminal__group">{text}</span>;
  const lines: { content: ReactNode; typed?: boolean }[] = [
    {content: <span className="profile-terminal__comment"># identity / static profile</span>},
    {content: ''}, {content: group('[profile]')},
    ...(profile.name.publish ? [{content: <>name = {value(profile.name.text)}</>, typed: true}] : []),
    ...(profile.positioning.publish ? [{content: <>target = {value(profile.positioning.text)}</>, typed: true}] : []),
    {content: ''}, {content: group('[project_coverage]')}, {content: 'areas = ['},
    ...profile.expertise.filter(item => item.publish).map(item => ({content: <>{'  '}{value(item.category)},</>})),
    {content: ']'},
  ];
  return <aside className="profile-terminal" aria-labelledby="terminal-title">
    <div className="profile-terminal__titlebar"><span className="profile-terminal__indicator" aria-hidden="true">›_</span><span id="terminal-title">profile.toml</span><span className="profile-terminal__mode">Read only</span></div>
    <pre className="profile-terminal__code"><code>{lines.map((line,index) => <span className="terminal-line" data-type-key={line.typed ? '' : undefined} key={index}><span className="terminal-line__ink">{line.content}{index < lines.length-1 ? '\n' : ''}</span></span>)}</code></pre>
  </aside>;
}
