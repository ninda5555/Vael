import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { calculateMoonPhaseForDate } from '../shared/astronomy.ts';
import { ZODIAC_SIGNS } from '../shared/zodiacCatalog.ts';

export function createUnsentMcpServer(): McpServer {
  const server = new McpServer({
    name: 'unsent-astronomy-reference',
    version: '1.0.0',
  });

  server.tool(
    'get_moon_phase',
    'Compute deterministic public lunar phase angle, illumination, and next New/Full Moon UTC instants for a date and IANA timezone.',
    {
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      timeZone: z.string().min(1).max(64).default('Asia/Kolkata'),
    },
    async ({ date, timeZone }) => {
      const result = calculateMoonPhaseForDate(date, timeZone);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    'get_sign_reference',
    'Return language-neutral cultural metadata and launch writing spark for one of the 12 zodiac signs.',
    {
      signId: z.enum([
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ]),
    },
    async ({ signId }) => {
      const sign = ZODIAC_SIGNS.find((s) => s.id === signId);
      if (!sign) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Unknown signId' }) }] };
      }
      const payload = {
        id: sign.id,
        glyph: sign.glyph,
        westernName: sign.westernName.en,
        rashiName: sign.rashiName.en,
        element: sign.element.en,
        modality: sign.modality.en,
        vedicRuler: sign.vedicRuler.en,
        artDirection: sign.artDirection,
        launchSpark: sign.prompts[0].spark.en,
        launchAction: sign.prompts[0].action.en,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
      };
    }
  );

  server.tool(
    'explain_fact_packet',
    'Return curated definitions of validated UNSENT astronomical fact packet fields without accessing user vaults or personal records.',
    {
      calculationKind: z.enum(['tropical_sun', 'vedic_moon', 'manual_lens', 'lunar_phase']),
    },
    async ({ calculationKind }) => {
      const explanations: Record<string, Record<string, string>> = {
        tropical_sun: {
          frame: 'Apparent geocentric tropical ecliptic longitude mapped into 12 half-open 30-degree sectors starting at 0 deg Aries.',
          uncertainty: 'Date-only or approximate times verify whether solar ingress occurred within the full civil interval; never assumes noon.',
        },
        vedic_moon: {
          frame: 'Sidereal Chandra Rasi using explicit Lahiri ayanamsa via configured Prokerala Birth Details adapter.',
          uncertainty: 'If birth time is unknown or unverified across the day, returns awaiting birth time or undetermined rather than guessing.',
        },
        manual_lens: {
          frame: 'Editorial creative lens selected directly by the writer with zero birth data collected.',
          uncertainty: 'Not an astronomical calculation.',
        },
        lunar_phase: {
          frame: 'Astronomy Engine MoonPhase angle (0=New, 90=First Quarter, 180=Full, 270=Last Quarter) evaluated at local noon.',
          uncertainty: 'Same-day New or Full Moon instants are explicitly flagged in the viewer timezone.',
        },
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                calculationKind,
                schemaVersion: 1,
                policy: 'Read-only reference metadata. Private vaults, recovery keys, and user profiles are never exposed.',
                definition: explanations[calculationKind],
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createUnsentMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
