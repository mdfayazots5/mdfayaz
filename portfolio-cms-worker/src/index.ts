import type { Env } from './types';
import { handlePreflight } from './cors';
import { errorResponse, jsonResponse, notFoundResponse } from './response';
import { requireAuth } from './middleware/auth-guard';
import { handleLogin } from './handlers/auth.handler';
import {
  handleGetEntries,
  handleCreateEntry,
  handleUpdateEntry,
  handleDeleteEntry,
} from './handlers/entries.handler';
import {
  handleGetServices,
  handleCreateService,
  handleUpdateService,
  handleDeleteService,
} from './handlers/services.handler';
import { handleGetFaq, handleCreateFaq, handleUpdateFaq, handleDeleteFaq } from './handlers/faq.handler';
import {
  handleGetUses,
  handleCreateUsesCategory,
  handleUpdateUsesCategory,
  handleDeleteUsesCategory,
  handleCreateUsesItem,
  handleUpdateUsesItem,
  handleDeleteUsesItem,
} from './handlers/uses.handler';
import {
  handleGetPrivacy,
  handleCreatePrivacy,
  handleUpdatePrivacy,
  handleDeletePrivacy,
  handleReorderPrivacy,
} from './handlers/privacy.handler';
import { handleGetAbout, handleUpdateAbout } from './handlers/about.handler';
import { handleGetSettings, handleUpdateSettings } from './handlers/settings.handler';
import { handleUpload, handleDeleteUpload } from './handlers/upload.handler';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE']);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const preflight = handlePreflight(request, env);
      if (preflight) return preflight;

      const url = new URL(request.url);
      const segments = url.pathname.split('/').filter(Boolean);
      const method = request.method;

      if (method === 'GET' && segments.length === 1 && segments[0] === 'health') {
        return jsonResponse(request, env, { status: 'ok' });
      }

      if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'login') {
        return handleLogin(request, env);
      }

      if (MUTATING_METHODS.has(method)) {
        const authorized = await requireAuth(request, env);
        if (!authorized) return errorResponse(request, env, 'Unauthorized', 401);
      }

      // /entries, /entries/:id
      if (segments[0] === 'entries') {
        if (segments.length === 1) {
          if (method === 'GET') return handleGetEntries(request, env);
          if (method === 'POST') return handleCreateEntry(request, env);
        }
        if (segments.length === 2) {
          if (method === 'PUT') return handleUpdateEntry(request, env, segments[1]);
          if (method === 'DELETE') return handleDeleteEntry(request, env, segments[1]);
        }
      }

      // /services, /services/:id
      if (segments[0] === 'services') {
        if (segments.length === 1) {
          if (method === 'GET') return handleGetServices(request, env);
          if (method === 'POST') return handleCreateService(request, env);
        }
        if (segments.length === 2) {
          if (method === 'PUT') return handleUpdateService(request, env, segments[1]);
          if (method === 'DELETE') return handleDeleteService(request, env, segments[1]);
        }
      }

      // /faq, /faq/:id
      if (segments[0] === 'faq') {
        if (segments.length === 1) {
          if (method === 'GET') return handleGetFaq(request, env);
          if (method === 'POST') return handleCreateFaq(request, env);
        }
        if (segments.length === 2) {
          if (method === 'PUT') return handleUpdateFaq(request, env, segments[1]);
          if (method === 'DELETE') return handleDeleteFaq(request, env, segments[1]);
        }
      }

      // /uses, /uses/:id, /uses/:categoryId/items, /uses/:categoryId/items/:itemId
      if (segments[0] === 'uses') {
        if (segments.length === 1) {
          if (method === 'GET') return handleGetUses(request, env);
          if (method === 'POST') return handleCreateUsesCategory(request, env);
        }
        if (segments.length === 2) {
          if (method === 'PUT') return handleUpdateUsesCategory(request, env, segments[1]);
          if (method === 'DELETE') return handleDeleteUsesCategory(request, env, segments[1]);
        }
        if (segments.length === 3 && segments[2] === 'items') {
          if (method === 'POST') return handleCreateUsesItem(request, env, segments[1]);
        }
        if (segments.length === 4 && segments[2] === 'items') {
          if (method === 'PUT') return handleUpdateUsesItem(request, env, segments[1], segments[3]);
          if (method === 'DELETE') return handleDeleteUsesItem(request, env, segments[1], segments[3]);
        }
      }

      // /privacy, /privacy/:id, /privacy/reorder
      if (segments[0] === 'privacy') {
        if (segments.length === 1) {
          if (method === 'GET') return handleGetPrivacy(request, env);
          if (method === 'POST') return handleCreatePrivacy(request, env);
        }
        if (segments.length === 2 && segments[1] === 'reorder') {
          if (method === 'POST') return handleReorderPrivacy(request, env);
        }
        if (segments.length === 2) {
          if (method === 'PUT') return handleUpdatePrivacy(request, env, segments[1]);
          if (method === 'DELETE') return handleDeletePrivacy(request, env, segments[1]);
        }
      }

      // /about
      if (segments[0] === 'about' && segments.length === 1) {
        if (method === 'GET') return handleGetAbout(request, env);
        if (method === 'PUT') return handleUpdateAbout(request, env);
      }

      // /settings
      if (segments[0] === 'settings' && segments.length === 1) {
        if (method === 'GET') return handleGetSettings(request, env);
        if (method === 'PUT') return handleUpdateSettings(request, env);
      }

      // /upload, /upload/:key
      if (segments[0] === 'upload') {
        if (segments.length === 1 && method === 'POST') return handleUpload(request, env);
        if (segments.length >= 2 && method === 'DELETE') {
          const key = segments.slice(1).join('/');
          return handleDeleteUpload(request, env, key);
        }
      }

      return notFoundResponse(request, env);
    } catch (error) {
      return errorResponse(request, env, `Unexpected error: ${(error as Error).message}`, 500);
    }
  },
};
