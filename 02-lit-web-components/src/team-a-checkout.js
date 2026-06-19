import { LitElement, html, css } from 'lit';

/**
 * Team A — checkout micro frontend (Lit 3, Shadow DOM ON).
 *
 * KEY INSIGHT for the paper:
 * Shadow DOM encapsulates style RULES — but CSS custom properties
 * INHERIT THROUGH the shadow boundary BY DESIGN (that is how themable
 * web components work). So token indirection collisions survive even
 * "perfect" style isolation. Shadow DOM is NOT a mitigation for D1.
 */

// Real-world pattern: importing a design-system package has the side
// effect of injecting document-level tokens. Team A ships its tokens:
const tokensA = new CSSStyleSheet();
tokensA.replaceSync(`
  :root {
    --brand-primary: #e2533f;
    --brand-radius: 12px;
  }
`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, tokensA];

export class TeamACheckout extends LitElement {
  static styles = css`
    /* These rules are perfectly encapsulated… */
    button {
      /* …but this var() reads a value from OUTSIDE the shadow root. */
      background: var(--brand-primary, #e2533f);
      border-radius: var(--brand-radius, 12px);
      color: #fff;
      border: none;
      padding: 14px 18px;
      font-weight: 700;
      cursor: pointer;
    }
  `;

  static properties = { route: { state: true } };

  constructor() {
    super();
    this.route = '/home';
    this.onHash = this.onHash.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // Router A: owns /home and /cart on the SHARED window URL.
    window.addEventListener('hashchange', this.onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.onHash);
    super.disconnectedCallback();
  }

  onHash() {
    const path = location.hash.slice(1) || '/home';
    if (path === '/home' || path === '/cart') {
      this.route = path;
      console.log(`[Lit Router A] handling ${path}`);
    }
  }

  render() {
    return html`
      <p>Team A view: <b>${this.route}</b></p>
      <button>Pay $9.00</button>
    `;
  }
}

customElements.define('team-a-checkout', TeamACheckout);
