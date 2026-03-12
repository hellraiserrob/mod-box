import { describe, it, expect } from 'vitest';
import {
  isValidRuleCondition,
  isValidHeaderRule,
  isValidBlockedRequest,
  isValidRedirectRequest,
  isValidNetworkConditionRule,
  isValidTab,
  isValidFolder,
  isValidExportPayload,
  isValidDataType,
} from './interfaces';

describe('Type Guards', () => {
  describe('isValidRuleCondition', () => {
    it('returns true for valid condition', () => {
      expect(isValidRuleCondition({
        urlFilter: '*.js',
        requestDomains: 'example.com',
      })).toBe(true);
    });

    it('returns true for empty strings', () => {
      expect(isValidRuleCondition({
        urlFilter: '',
        requestDomains: '',
      })).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidRuleCondition(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidRuleCondition(undefined)).toBe(false);
    });

    it('returns false for missing urlFilter', () => {
      expect(isValidRuleCondition({
        requestDomains: 'example.com',
      })).toBe(false);
    });

    it('returns false for missing requestDomains', () => {
      expect(isValidRuleCondition({
        urlFilter: '*.js',
      })).toBe(false);
    });

    it('returns false for non-string urlFilter', () => {
      expect(isValidRuleCondition({
        urlFilter: 123,
        requestDomains: 'example.com',
      })).toBe(false);
    });

    it('accepts optional document property', () => {
      expect(isValidRuleCondition({
        urlFilter: '',
        requestDomains: 'example.com',
        document: true,
      })).toBe(true);
    });
  });

  describe('isValidHeaderRule', () => {
    const validRule = {
      active: true,
      name: 'X-Custom-Header',
      value: 'test-value',
      operation: 'set' as const,
      condition: { urlFilter: '', requestDomains: '' },
    };

    it('returns true for valid header rule', () => {
      expect(isValidHeaderRule(validRule)).toBe(true);
    });

    it('returns true without operation (defaults to set)', () => {
      const { operation, ...ruleWithoutOp } = validRule;
      expect(isValidHeaderRule(ruleWithoutOp)).toBe(true);
    });

    it('returns true for remove operation', () => {
      expect(isValidHeaderRule({ ...validRule, operation: 'remove' })).toBe(true);
    });

    it('returns false for invalid operation', () => {
      expect(isValidHeaderRule({ ...validRule, operation: 'invalid' })).toBe(false);
    });

    it('returns false for non-boolean active', () => {
      expect(isValidHeaderRule({ ...validRule, active: 'true' })).toBe(false);
    });

    it('returns false for non-string name', () => {
      expect(isValidHeaderRule({ ...validRule, name: 123 })).toBe(false);
    });

    it('returns false for missing condition', () => {
      const { condition, ...ruleWithoutCondition } = validRule;
      expect(isValidHeaderRule(ruleWithoutCondition)).toBe(false);
    });

    it('returns false for invalid condition', () => {
      expect(isValidHeaderRule({ ...validRule, condition: 'invalid' })).toBe(false);
    });
  });

  describe('isValidBlockedRequest', () => {
    const validBlock = {
      active: true,
      condition: { urlFilter: '*.js', requestDomains: '', document: false },
    };

    it('returns true for valid blocked request', () => {
      expect(isValidBlockedRequest(validBlock)).toBe(true);
    });

    it('returns false for non-boolean active', () => {
      expect(isValidBlockedRequest({ ...validBlock, active: 1 })).toBe(false);
    });

    it('returns false for missing condition', () => {
      expect(isValidBlockedRequest({ active: true })).toBe(false);
    });
  });

  describe('isValidRedirectRequest', () => {
    const validRedirect = {
      active: true,
      url: 'https://example.com/new',
      condition: { urlFilter: '/old', requestDomains: '' },
    };

    it('returns true for valid redirect request', () => {
      expect(isValidRedirectRequest(validRedirect)).toBe(true);
    });

    it('returns false for missing url', () => {
      const { url, ...noUrl } = validRedirect;
      expect(isValidRedirectRequest(noUrl)).toBe(false);
    });

    it('returns false for non-string url', () => {
      expect(isValidRedirectRequest({ ...validRedirect, url: 123 })).toBe(false);
    });
  });

  describe('isValidNetworkConditionRule', () => {
    const validNetworkCondition = {
      active: true,
      preset: 'slow3g',
      condition: { urlFilter: '', requestDomains: '' },
    };

    it('returns true for valid network condition rule', () => {
      expect(isValidNetworkConditionRule(validNetworkCondition)).toBe(true);
    });

    it('returns true for all valid presets', () => {
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 'offline' })).toBe(true);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 'slow3g' })).toBe(true);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 'slow4g' })).toBe(true);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 'fast4g' })).toBe(true);
    });

    it('returns false for invalid preset', () => {
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 'invalid' })).toBe(false);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: '3g' })).toBe(false);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: '' })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidNetworkConditionRule(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidNetworkConditionRule(undefined)).toBe(false);
    });

    it('returns false for non-boolean active', () => {
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, active: 'true' })).toBe(false);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, active: 1 })).toBe(false);
    });

    it('returns false for non-string preset', () => {
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: 123 })).toBe(false);
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, preset: null })).toBe(false);
    });

    it('returns false for missing preset', () => {
      const { preset, ...noPreset } = validNetworkCondition;
      expect(isValidNetworkConditionRule(noPreset)).toBe(false);
    });

    it('returns false for missing condition', () => {
      const { condition, ...noCondition } = validNetworkCondition;
      expect(isValidNetworkConditionRule(noCondition)).toBe(false);
    });

    it('returns false for null condition', () => {
      expect(isValidNetworkConditionRule({ ...validNetworkCondition, condition: null })).toBe(false);
    });

    it('returns false for invalid condition', () => {
      expect(isValidNetworkConditionRule({ 
        ...validNetworkCondition, 
        condition: { urlFilter: 123, requestDomains: '' } 
      })).toBe(false);
      expect(isValidNetworkConditionRule({ 
        ...validNetworkCondition, 
        condition: { urlFilter: '', requestDomains: 123 } 
      })).toBe(false);
    });

    it('returns false for condition missing urlFilter', () => {
      expect(isValidNetworkConditionRule({ 
        ...validNetworkCondition, 
        condition: { requestDomains: '' } 
      })).toBe(false);
    });

    it('returns false for condition missing requestDomains', () => {
      expect(isValidNetworkConditionRule({ 
        ...validNetworkCondition, 
        condition: { urlFilter: '' } 
      })).toBe(false);
    });

    it('returns true with urlFilter and requestDomains populated', () => {
      expect(isValidNetworkConditionRule({
        active: true,
        preset: 'offline',
        condition: { urlFilter: '*.js', requestDomains: 'example.com' },
      })).toBe(true);
    });
  });

  describe('isValidTab', () => {
    const validTab = {
      name: 'Test Tab',
      active: true,
      requestDomains: 'example.com',
      requestHeaders: [],
      responseHeaders: [],
      blockedRequests: [],
      redirectRequests: [],
    };

    it('returns true for valid tab', () => {
      expect(isValidTab(validTab)).toBe(true);
    });

    it('returns true without requestDomains', () => {
      const { requestDomains, ...tabWithoutDomains } = validTab;
      expect(isValidTab(tabWithoutDomains)).toBe(true);
    });

    it('returns false for non-string name', () => {
      expect(isValidTab({ ...validTab, name: 123 })).toBe(false);
    });

    it('returns false for non-array requestHeaders', () => {
      expect(isValidTab({ ...validTab, requestHeaders: 'invalid' })).toBe(false);
    });

    it('returns false for missing arrays', () => {
      const { blockedRequests, ...tabWithoutBlocked } = validTab;
      expect(isValidTab(tabWithoutBlocked)).toBe(false);
    });

    it('returns true with populated arrays', () => {
      const tabWithRules = {
        ...validTab,
        requestHeaders: [{
          active: true,
          name: 'X-Test',
          value: 'test',
          condition: { urlFilter: '', requestDomains: '' },
        }],
      };
      expect(isValidTab(tabWithRules)).toBe(true);
    });

    it('returns true without networkConditions (optional)', () => {
      expect(isValidTab(validTab)).toBe(true);
    });

    it('returns true with empty networkConditions array', () => {
      expect(isValidTab({ ...validTab, networkConditions: [] })).toBe(true);
    });

    it('returns true with populated networkConditions array', () => {
      const tabWithNetworkConditions = {
        ...validTab,
        networkConditions: [{
          active: true,
          preset: 'slow3g',
          condition: { urlFilter: '', requestDomains: '' },
        }],
      };
      expect(isValidTab(tabWithNetworkConditions)).toBe(true);
    });

    it('returns false for non-array networkConditions', () => {
      expect(isValidTab({ ...validTab, networkConditions: 'invalid' })).toBe(false);
      expect(isValidTab({ ...validTab, networkConditions: {} })).toBe(false);
    });
  });

  describe('isValidFolder', () => {
    const validFolder = {
      name: 'Test Folder',
      active: true,
      tabs: [{
        name: 'Test Tab',
        active: true,
        requestHeaders: [],
        responseHeaders: [],
        blockedRequests: [],
        redirectRequests: [],
      }],
    };

    it('returns true for valid folder', () => {
      expect(isValidFolder(validFolder)).toBe(true);
    });

    it('returns true for folder with empty tabs array', () => {
      expect(isValidFolder({ ...validFolder, tabs: [] })).toBe(true);
    });

    it('returns false for non-string name', () => {
      expect(isValidFolder({ ...validFolder, name: null })).toBe(false);
    });

    it('returns false for non-array tabs', () => {
      expect(isValidFolder({ ...validFolder, tabs: 'invalid' })).toBe(false);
    });

    it('returns false for invalid tab in tabs array', () => {
      expect(isValidFolder({ ...validFolder, tabs: [{ invalid: true }] })).toBe(false);
    });

    it('returns false for missing active', () => {
      const { active, ...noActive } = validFolder;
      expect(isValidFolder(noActive)).toBe(false);
    });
  });

  describe('isValidExportPayload', () => {
    const validPayload = {
      name: 'modbox' as const,
      version: 1,
      folders: [{
        name: 'Test Folder',
        active: true,
        tabs: [{
          name: 'Test Tab',
          active: true,
          requestHeaders: [],
          responseHeaders: [],
          blockedRequests: [],
          redirectRequests: [],
        }],
      }],
    };

    it('returns true for valid export payload', () => {
      expect(isValidExportPayload(validPayload)).toBe(true);
    });

    it('returns false for wrong name', () => {
      expect(isValidExportPayload({ ...validPayload, name: 'other' })).toBe(false);
    });

    it('returns false for non-number version', () => {
      expect(isValidExportPayload({ ...validPayload, version: '1' })).toBe(false);
    });

    it('returns false for non-array folders', () => {
      expect(isValidExportPayload({ ...validPayload, folders: {} })).toBe(false);
    });

    it('returns false for invalid folder in array', () => {
      expect(isValidExportPayload({ ...validPayload, folders: [{ bad: true }] })).toBe(false);
    });

    it('returns true with empty folders array', () => {
      expect(isValidExportPayload({ ...validPayload, folders: [] })).toBe(true);
    });
  });

  describe('isValidDataType', () => {
    const validData = {
      active: true,
      folders: [{
        name: 'Test Folder',
        active: true,
        tabs: [{
          name: 'Test Tab',
          active: true,
          requestHeaders: [],
          responseHeaders: [],
          blockedRequests: [],
          redirectRequests: [],
        }],
      }],
    };

    it('returns true for valid data', () => {
      expect(isValidDataType(validData)).toBe(true);
    });

    it('returns false for non-boolean active', () => {
      expect(isValidDataType({ ...validData, active: 'true' })).toBe(false);
    });

    it('returns false for non-array folders', () => {
      expect(isValidDataType({ ...validData, folders: null })).toBe(false);
    });

    it('returns true with empty folders', () => {
      expect(isValidDataType({ active: true, folders: [] })).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidDataType(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidDataType(undefined)).toBe(false);
    });

    it('returns false for primitive types', () => {
      expect(isValidDataType('string')).toBe(false);
      expect(isValidDataType(123)).toBe(false);
      expect(isValidDataType(true)).toBe(false);
    });
  });
});

describe('Real-world validation scenarios', () => {
  it('validates a realistic full data structure', () => {
    const realData = {
      active: true,
      folders: [
        {
          name: 'Development',
          active: true,
          tabs: [
            {
              name: 'API Headers',
              active: true,
              requestDomains: 'api.example.com',
              requestHeaders: [
                {
                  active: true,
                  name: 'Authorization',
                  value: 'Bearer token123',
                  operation: 'set' as const,
                  condition: { urlFilter: '', requestDomains: '' },
                },
              ],
              responseHeaders: [],
              blockedRequests: [],
              redirectRequests: [],
            },
            {
              name: 'Block Ads',
              active: false,
              requestHeaders: [],
              responseHeaders: [],
              blockedRequests: [
                {
                  active: true,
                  condition: { urlFilter: '*ads*', requestDomains: '', document: false },
                },
              ],
              redirectRequests: [],
            },
          ],
        },
        {
          name: 'Testing',
          active: false,
          tabs: [
            {
              name: 'Redirects',
              active: true,
              requestHeaders: [],
              responseHeaders: [],
              blockedRequests: [],
              redirectRequests: [
                {
                  active: true,
                  url: 'https://localhost:3000/api',
                  condition: { urlFilter: '/api/*', requestDomains: 'prod.example.com' },
                },
              ],
            },
          ],
        },
      ],
    };

    expect(isValidDataType(realData)).toBe(true);
  });

  it('validates export payload from real export', () => {
    const exportPayload = {
      name: 'modbox' as const,
      version: 1,
      folders: [
        {
          name: 'Exported Folder',
          active: true,
          tabs: [
            {
              name: 'Exported Tab',
              active: true,
              requestDomains: '',
              requestHeaders: [],
              responseHeaders: [
                {
                  active: true,
                  name: 'X-Frame-Options',
                  value: 'SAMEORIGIN',
                  condition: { urlFilter: '', requestDomains: 'secure.example.com' },
                },
              ],
              blockedRequests: [],
              redirectRequests: [],
            },
          ],
        },
      ],
    };

    expect(isValidExportPayload(exportPayload)).toBe(true);
  });

  it('rejects malformed import data', () => {
    // Missing required arrays
    const badImport1 = {
      name: 'modbox',
      version: 1,
      folders: [{ name: 'Bad Folder', active: true, tabs: [] }],
    };
    // tabs array has invalid tab (missing arrays)
    expect(isValidExportPayload({
      ...badImport1,
      folders: [{
        name: 'Folder',
        active: true,
        tabs: [{ name: 'Tab', active: true }], // Missing arrays
      }],
    })).toBe(false);

    // Wrong payload name
    const badImport2 = {
      name: 'notmodbox',
      version: 1,
      folders: [],
    };
    expect(isValidExportPayload(badImport2)).toBe(false);
  });
});
