/**
 * Partner / ecosystem list rendered on the homepage "Ecosystem & integration" section.
 *
 * SEEDED with the open INDUSTRIAL INTERFACE STANDARDS GYUTRON hardware supports — honest, and no
 * third-party company logos are implied. To show real partner companies, add entries with a `logo`
 * image path (drop the logo in public/ and astro/public/); a logo renders as an image, otherwise the
 * name renders as a text tile. See docs/CONTENT_GUIDE.md "Edit partners / ecosystem".
 */
import type { Partner } from '../types/partner';

export const PARTNERS: Partner[] = [
  { id: 'gige-vision', name: 'GigE Vision' },
  { id: 'genicam', name: 'GenICam' },
  { id: 'usb3-vision', name: 'USB3 Vision' },
  { id: 'opc-ua', name: 'OPC UA' },
  { id: 'profinet', name: 'PROFINET' },
  { id: 'ethernet-ip', name: 'EtherNet/IP' },
  { id: 'modbus-tcp', name: 'Modbus TCP' },
  { id: 'io-link', name: 'IO-Link' },
];
