const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

try {
  require('dotenv').config();
} catch (_) {
  // Netlify supplies environment variables directly in production.
}

const DEFAULT_PROJECT_ID = 'advik-digital-twin';
const LANGUAGE_CODE = 'en';
const FALLBACK_REPLY = "I don't have a great answer for that yet, but you can ask me about Advik's projects, coding journey, Good Plate, skills, goals, or contact info.";
const PERMISSION_HELP =
  'Dialogflow permission denied. Grant dialogflow-portfolio-bot@advik-digital-twin-api.iam.gserviceaccount.com Dialogflow API Client access in the old Google Cloud project advik-digital-twin under IAM.';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function getCredentials() {
  const rawCredentials = process.env.DIALOGFLOW_CREDENTIALS_JSON;
  if (!rawCredentials) return undefined;

  const credentials = JSON.parse(rawCredentials);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  return credentials;
}

function getSessionsClient() {
  const credentials = getCredentials();
  return credentials ? new dialogflow.SessionsClient({ credentials }) : new dialogflow.SessionsClient();
}

function normalizeSessionId(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) return `website-${uuidv4()}`;
  return sessionId.trim().replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 80) || `website-${uuidv4()}`;
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return json(400, { error: 'Invalid JSON request body' });
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) return json(400, { error: 'Message is required' });

  const projectId = process.env.DIALOGFLOW_PROJECT_ID || DEFAULT_PROJECT_ID;
  const sessionId = normalizeSessionId(payload.sessionId);

  try {
    const client = getSessionsClient();
    const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

    const [response] = await client.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: LANGUAGE_CODE
        }
      }
    });

    const result = response.queryResult || {};
    const fulfillmentMessages = Array.isArray(result.fulfillmentMessages)
      ? result.fulfillmentMessages
      : [];
    const messageText = fulfillmentMessages
      .map(item => item.text && Array.isArray(item.text.text) ? item.text.text.join('\n') : '')
      .filter(Boolean)
      .join('\n');

    return json(200, {
      reply: result.fulfillmentText || messageText || FALLBACK_REPLY,
      intent: result.intent && result.intent.displayName ? result.intent.displayName : null,
      confidence: typeof result.intentDetectionConfidence === 'number'
        ? result.intentDetectionConfidence
        : 0
    });
  } catch (error) {
    console.error('Dialogflow detectIntent failed:', error);

    if (error && (error.code === 7 || /PERMISSION_DENIED/i.test(error.message || ''))) {
      return json(403, {
        error: 'PERMISSION_DENIED',
        reply: PERMISSION_HELP
      });
    }

    if (error instanceof SyntaxError) {
      return json(500, {
        error: 'INVALID_DIALOGFLOW_CREDENTIALS_JSON',
        reply: 'DIALOGFLOW_CREDENTIALS_JSON could not be parsed. Paste the full service account JSON as the Netlify environment variable value.'
      });
    }

    return json(500, {
      error: 'DIALOGFLOW_REQUEST_FAILED',
      reply: 'Dialogflow could not be reached right now.'
    });
  }
};
