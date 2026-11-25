import { colour } from './colour.js';
import { contact } from './contact.js';
import { dates } from './dates.js';
import { financial } from './financial.js';
import { forms } from './forms.js';
import { geo } from './geo.js';
import { http } from './http.js';
import { commerce, health, helpers, service } from './misc.js';
import { products } from './products.js';
import { security } from './security.js';
import { identifiers } from './identifiers.js';
import { national } from './national.js';
import { network } from './network.js';
import { passwords } from './passwords.js';
import { software } from './software.js';
import { text } from './text.js';
import type { Spec } from './types.js';

export interface Section {
  title: string;
  anchor: string;
  specs: Spec[];
}

/** Every spec, grouped as in docs/validators.md. */
export const sections: Section[] = [
  { title: '1. Contact and identity', anchor: '1-contact-and-identity', specs: contact },
  { title: '2. Network and web', anchor: '2-network-and-web', specs: network },
  { title: '3. Identifiers', anchor: '3-identifiers', specs: identifiers },
  { title: '4. Numbers and text', anchor: '4-numbers-and-text', specs: text },
  { title: '5. Dates and time', anchor: '5-dates-and-time', specs: dates },
  { title: '6. Financial', anchor: '6-financial', specs: financial },
  {
    title: '7. Products, publications and devices',
    anchor: '7-products-publications-and-devices',
    specs: products
  },
  { title: '8. Geography and locale', anchor: '8-geography-and-locale', specs: geo },
  {
    title: '9. National and tax identifiers',
    anchor: '9-national-and-tax-identifiers',
    specs: national
  },
  { title: '10. Colours', anchor: '10-colours', specs: colour },
  {
    title: '11. Software and developer tooling',
    anchor: '11-software-and-developer-tooling',
    specs: software
  },
  {
    title: '12. Passwords and one-time codes',
    anchor: '12-passwords-and-one-time-codes',
    specs: passwords
  },
  { title: '13. HTTP and API requests', anchor: '13-http-and-api-requests', specs: http },
  { title: '14. Forms and generic input', anchor: '14-forms-and-generic-input', specs: forms },
  {
    title: '15. Security and input hygiene',
    anchor: '15-security-and-input-hygiene',
    specs: security
  },
  { title: '16. Health and science', anchor: '16-health-and-science', specs: health },
  { title: '17. Commerce and mobile', anchor: '17-commerce-and-mobile', specs: commerce },
  {
    title: '18. Service-specific identifiers',
    anchor: '18-service-specific-identifiers',
    specs: service
  },
  { title: 'Helpers', anchor: 'helpers', specs: helpers }
];
