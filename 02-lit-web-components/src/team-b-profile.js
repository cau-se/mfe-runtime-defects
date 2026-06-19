import { LitElement, html, css } from 'lit';

/**
 * Team B — profile micro frontend (Lit 3, Shadow DOM ON).
 * Internally correct. Built and tested in isolation: all green.
 */

// Team B's design system uses the SAME token names (a very common
// accident: both teams forked the same starter / token spec draft).
// D1: last import wins at document level — Team A's button turns blue.
const tokensB = new CSSStyleSheet();
tokensB.replaceSync(`
  :root {
    --brand-primary: #2b6fe3;
    --brand-radius: 0px;
  }
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, tokensB];

export class TeamBProfile extends LitElement {
  static styles = css`
    .card {
      border: 2px solid var(--brand-primary, #2b6fe3);
      border-radius: var(--brand-radius, 0px);
      padding: 12px;
    }
  `;

  constructor() {
    super();
    this.onHash = this.onHash.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // D2: Router B also listens to the shared URL — with a catch-all.
    window.addEventListener('hashchange', this.onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.onHash);
    super.disconnectedCallback();
  }

  onHash() {
    const path = location.hash.slice(1);
    if (path !== '/promo') {
      console.log(`[Lit Router B] "${path}" unknown to me → /promo`);
      location.hash = '#/promo'; // hijacks Team A's /cart navigation
    }
  }

  render() {
    return html`<div class="card">Hi, Sam 👋 (Team B profile)</div>`;
  }
}

customElements.define('team-b-profile', TeamBProfile);
