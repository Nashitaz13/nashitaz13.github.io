import external from '../assets/icons/ui-arrow-up-right.svg?raw';
import up from '../assets/icons/ui-arrow-up.svg?raw';
import chevron from '../assets/icons/ui-chevron-up.svg?raw';
import copy from '../assets/icons/ui-copy.svg?raw';
import check from '../assets/icons/ui-check.svg?raw';
import file from '../assets/icons/ui-file-text.svg?raw';
import code from '../assets/icons/ui-file-code.svg?raw';
import config from '../assets/icons/ui-settings-2.svg?raw';
import test from '../assets/icons/ui-flask-conical.svg?raw';
import table from '../assets/icons/ui-table-2.svg?raw';
import branch from '../assets/icons/ui-git-branch.svg?raw';
import box from '../assets/icons/ui-box.svg?raw';
import mail from '../assets/icons/ui-mail.svg?raw';
import github from '../assets/icons/ui-github.svg?raw';
import linkedin from '../assets/icons/ui-linkedin.svg?raw';
import instagram from '../assets/icons/ui-instagram.svg?raw';
import pin from '../assets/icons/ui-map-pin.svg?raw';

const icons = { external, up, chevron, copy, check, file, code, config, test, table, branch, box, mail, github, linkedin, instagram, pin };
export type IconName = keyof typeof icons;

// Only trusted, local Lucide SVGs from the pinned asset registry enter this markup.
export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span className={`ui-icon ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[name] }} />;
}
