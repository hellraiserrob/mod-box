import { describe, it, expect } from 'vitest';
import { generateRules, generateNetworkConditionRules, parseDomains, cleanDomain, getChromeVersion, isNetworkConditionsSupported } from './utils';
import { DataType } from './interfaces';

/**
 * Helper to create minimal valid data structure
 */
function createData(overrides: Partial<DataType> = {}): DataType {
  return {
    active: true,
    folders: [],
    ...overrides,
  };
}

function createFolder(overrides = {}) {
  return {
    name: "Test Folder",
    active: true,
    tabs: [],
    ...overrides,
  };
}

function createTab(overrides = {}) {
  return {
    name: "Test Tab",
    active: true,
    requestDomains: "",
    requestHeaders: [],
    responseHeaders: [],
    blockedRequests: [],
    redirectRequests: [],
    networkConditions: [],
    ...overrides,
  };
}

function createHeaderRule(overrides = {}) {
  return {
    active: true,
    name: "X-Custom-Header",
    value: "test-value",
    operation: "set" as const,
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
    ...overrides,
  };
}

function createBlockRule(overrides = {}) {
  return {
    active: true,
    condition: {
      urlFilter: "*.js",
      requestDomains: "",
      document: false,
    },
    ...overrides,
  };
}

function createRedirectRule(overrides = {}) {
  return {
    active: true,
    url: "https://example.com/redirect",
    condition: {
      urlFilter: "/old-path",
      requestDomains: "",
    },
    ...overrides,
  };
}

function createNetworkConditionRule(overrides = {}) {
  return {
    active: true,
    preset: "slow3g" as const,
    condition: {
      urlFilter: "",
      requestDomains: "",
    },
    ...overrides,
  };
}

describe('generateRules', () => {
  describe('basic functionality', () => {
    it('returns empty array when data.active is false', () => {
      const data = createData({ active: false });
      expect(generateRules(data)).toEqual([]);
    });

    it('returns empty array when folders is empty', () => {
      const data = createData({ folders: [] });
      expect(generateRules(data)).toEqual([]);
    });

    it('returns empty array when data is null/undefined', () => {
      expect(generateRules(null as any)).toEqual([]);
      expect(generateRules(undefined as any)).toEqual([]);
    });

    it('returns empty array when folders is not an array', () => {
      const data = { active: true, folders: "invalid" } as any;
      expect(generateRules(data)).toEqual([]);
    });

    it('skips inactive folders', () => {
      const data = createData({
        folders: [
          createFolder({
            active: false,
            tabs: [createTab({ requestHeaders: [createHeaderRule()] })],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });

    it('skips inactive tabs', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                active: false,
                requestHeaders: [createHeaderRule()],
              }),
            ],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });

    it('generates sequential IDs', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule(), createHeaderRule({ name: "X-Another" })],
              }),
            ],
          }),
        ],
      });
      const rules = generateRules(data);
      expect(rules[0].id).toBe(1);
      expect(rules[1].id).toBe(2);
    });
  });

  describe('request header rules', () => {
    it('generates a request header rule with set operation', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule()],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(1);
      expect(rules[0]).toMatchObject({
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{
            header: "X-Custom-Header",
            operation: "set",
            value: "test-value",
          }],
        },
      });
    });

    it('generates a request header rule with remove operation (no value)', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule({ operation: "remove" })],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].action.requestHeaders?.[0]).not.toHaveProperty("value");
      expect(rules[0].action.requestHeaders?.[0].operation).toBe("remove");
    });

    it('skips inactive header rules', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule({ active: false })],
              }),
            ],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });

    it('skips header rules with empty name', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule({ name: "" })],
              }),
            ],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });

    it('skips header rules with whitespace-only name', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule({ name: "   " })],
              }),
            ],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });
  });

  describe('response header rules', () => {
    it('generates a response header rule', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                responseHeaders: [createHeaderRule({ name: "X-Response-Header" })],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(1);
      expect(rules[0].action).toHaveProperty("responseHeaders");
      expect(rules[0].action.responseHeaders?.[0].header).toBe("X-Response-Header");
    });
  });

  describe('redirect rules', () => {
    it('generates a redirect rule', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                redirectRequests: [createRedirectRule()],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(1);
      expect(rules[0]).toMatchObject({
        action: {
          type: "redirect",
          redirect: { url: "https://example.com/redirect" },
        },
      });
    });

    it('skips redirect rules with empty URL', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                redirectRequests: [createRedirectRule({ url: "" })],
              }),
            ],
          }),
        ],
      });
      expect(generateRules(data)).toEqual([]);
    });
  });

  describe('block rules', () => {
    it('generates a block rule for assets', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                blockedRequests: [createBlockRule()],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(1);
      expect(rules[0].action.type).toBe("block");
      expect(rules[0].condition.resourceTypes).not.toContain("main_frame");
      expect(rules[0].condition.resourceTypes).not.toContain("sub_frame");
    });

    it('generates a document block rule', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                blockedRequests: [
                  createBlockRule({
                    condition: { urlFilter: "", requestDomains: "blocked.com", document: true },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.resourceTypes).toContain("main_frame");
      expect(rules[0].condition.resourceTypes).toContain("sub_frame");
      expect(rules[0].condition.resourceTypes).toHaveLength(2);
    });

    it('document block rule does not include urlFilter', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                blockedRequests: [
                  createBlockRule({
                    condition: { urlFilter: "should-be-ignored", requestDomains: "blocked.com", document: true },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition).not.toHaveProperty("urlFilter");
    });
  });

  describe('domain handling', () => {
    it('uses rule-specific requestDomains', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestDomains: "fallback.com",
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "", requestDomains: "specific.com" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.requestDomains).toEqual(["specific.com"]);
    });

    it('falls back to tab requestDomains when rule has none', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestDomains: "fallback.com",
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "", requestDomains: "" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.requestDomains).toEqual(["fallback.com"]);
    });

    it('handles multiple domains', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "", requestDomains: "one.com, two.com, three.com" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.requestDomains).toEqual(["one.com", "two.com", "three.com"]);
    });

    it('strips protocol from domains', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "", requestDomains: "https://secure.com, http://insecure.com" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.requestDomains).toEqual(["secure.com", "insecure.com"]);
    });
  });

  describe('urlFilter handling', () => {
    it('includes urlFilter when specified', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "*api*", requestDomains: "" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition.urlFilter).toBe("*api*");
    });

    it('excludes urlFilter when empty', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestHeaders: [
                  createHeaderRule({
                    condition: { urlFilter: "", requestDomains: "example.com" },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules[0].condition).not.toHaveProperty("urlFilter");
    });
  });

  describe('complex scenarios', () => {
    it('generates rules from multiple folders, tabs, and rule types', () => {
      const data = createData({
        folders: [
          createFolder({
            name: "Folder 1",
            tabs: [
              createTab({
                requestHeaders: [createHeaderRule()],
                responseHeaders: [createHeaderRule({ name: "X-Response" })],
              }),
            ],
          }),
          createFolder({
            name: "Folder 2",
            tabs: [
              createTab({
                blockedRequests: [createBlockRule()],
                redirectRequests: [createRedirectRule()],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(4);
      expect(rules.map(r => r.id)).toEqual([1, 2, 3, 4]);
    });

    it('handles mixed active/inactive items correctly', () => {
      const data = createData({
        folders: [
          createFolder({ active: false, tabs: [createTab({ requestHeaders: [createHeaderRule()] })] }),
          createFolder({
            tabs: [
              createTab({ active: false, requestHeaders: [createHeaderRule()] }),
              createTab({
                requestHeaders: [
                  createHeaderRule({ active: false }),
                  createHeaderRule({ name: "Active-Header" }),
                ],
              }),
            ],
          }),
        ],
      });

      const rules = generateRules(data);
      expect(rules).toHaveLength(1);
      expect(rules[0].action.requestHeaders?.[0].header).toBe("Active-Header");
    });
  });
});

describe('parseDomains', () => {
  it('parses single domain', () => {
    expect(parseDomains("example.com")).toEqual(["example.com"]);
  });

  it('parses multiple comma-separated domains', () => {
    expect(parseDomains("one.com,two.com,three.com")).toEqual(["one.com", "two.com", "three.com"]);
  });

  it('trims whitespace from domains', () => {
    expect(parseDomains("  one.com  ,  two.com  ")).toEqual(["one.com", "two.com"]);
  });

  it('strips protocols', () => {
    expect(parseDomains("https://secure.com,http://insecure.com")).toEqual(["secure.com", "insecure.com"]);
  });

  it('filters out empty strings', () => {
    expect(parseDomains("one.com,,two.com,")).toEqual(["one.com", "two.com"]);
  });

  it('returns empty array for empty string', () => {
    expect(parseDomains("")).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(parseDomains(null as any)).toEqual([]);
    expect(parseDomains(undefined as any)).toEqual([]);
  });
});

describe('cleanDomain', () => {
  it('trims whitespace', () => {
    expect(cleanDomain("  example.com  ")).toBe("example.com");
  });

  it('strips https://', () => {
    expect(cleanDomain("https://example.com")).toBe("example.com");
  });

  it('strips http://', () => {
    expect(cleanDomain("http://example.com")).toBe("example.com");
  });

  it('is case-insensitive for protocol', () => {
    expect(cleanDomain("HTTPS://example.com")).toBe("example.com");
    expect(cleanDomain("HTTP://example.com")).toBe("example.com");
  });

  it('returns empty string for null/undefined', () => {
    expect(cleanDomain(null as any)).toBe("");
    expect(cleanDomain(undefined as any)).toBe("");
  });

  it('preserves path and query string', () => {
    expect(cleanDomain("https://example.com/path?query=1")).toBe("example.com/path?query=1");
  });

  it('handles mixed case protocols', () => {
    expect(cleanDomain("HtTpS://example.com")).toBe("example.com");
    expect(cleanDomain("HtTp://example.com")).toBe("example.com");
  });

  it('handles empty string', () => {
    expect(cleanDomain("")).toBe("");
  });

  it('handles whitespace-only string', () => {
    expect(cleanDomain("   ")).toBe("");
  });

  it('handles domain with port', () => {
    expect(cleanDomain("https://example.com:8080")).toBe("example.com:8080");
  });

  it('handles domain with subdomain', () => {
    expect(cleanDomain("https://api.sub.example.com")).toBe("api.sub.example.com");
  });
});

describe('parseDomains edge cases', () => {
  it('handles domains with ports', () => {
    expect(parseDomains("example.com:8080")).toEqual(["example.com:8080"]);
  });

  it('handles multiple domains with protocols mixed', () => {
    expect(parseDomains("https://a.com, http://b.com, c.com")).toEqual(["a.com", "b.com", "c.com"]);
  });

  it('handles commas with varying whitespace', () => {
    expect(parseDomains("a.com,b.com,  c.com  ,d.com")).toEqual(["a.com", "b.com", "c.com", "d.com"]);
  });

  it('handles newline-separated domains', () => {
    expect(parseDomains("a.com\nb.com\nc.com")).toEqual(["a.com", "b.com", "c.com"]);
  });

  it('handles mixed comma and newline separators', () => {
    expect(parseDomains("a.com, b.com\nc.com")).toEqual(["a.com", "b.com", "c.com"]);
  });

  it('filters out duplicate domains', () => {
    expect(parseDomains("example.com, example.com")).toEqual(["example.com"]);
  });

  it('filters out duplicates when protocols differ', () => {
    expect(parseDomains("https://example.com, http://example.com")).toEqual(["example.com"]);
  });

  it('handles array input', () => {
    expect(parseDomains(["a.com", "b.com"])).toEqual(["a.com", "b.com"]);
  });

  it('cleans domains in array input', () => {
    expect(parseDomains(["https://a.com", "  b.com  "])).toEqual(["a.com", "b.com"]);
  });
});

describe('generateRules security and limits', () => {
  it('handles very long domain lists', () => {
    const domains = Array.from({ length: 100 }, (_, i) => `domain${i}.com`).join(',');
    const data = createData({
      folders: [
        createFolder({
          tabs: [
            createTab({
              requestDomains: domains,
              requestHeaders: [createHeaderRule()],
            }),
          ],
        }),
      ],
    });

    const rules = generateRules(data);
    expect(rules).toHaveLength(1);
    expect(rules[0].condition.requestDomains).toHaveLength(100);
  });

  it('handles deeply nested folder/tab structure', () => {
    const data = createData({
      folders: Array.from({ length: 10 }, (_, i) => 
        createFolder({
          name: `Folder ${i}`,
          tabs: Array.from({ length: 5 }, (_, j) => 
            createTab({
              name: `Tab ${j}`,
              requestHeaders: [createHeaderRule({ name: `Header-${i}-${j}` })],
            })
          ),
        })
      ),
    });

    const rules = generateRules(data);
    // 10 folders * 5 tabs * 1 header rule each = 50 rules
    expect(rules).toHaveLength(50);
    // Each should have a unique sequential id
    rules.forEach((rule, index) => {
      expect(rule.id).toBe(index + 1);
    });
  });

  it('handles special characters in header values', () => {
    const data = createData({
      folders: [
        createFolder({
          tabs: [
            createTab({
              requestHeaders: [
                createHeaderRule({
                  name: 'X-Special',
                  value: 'value with "quotes" and \'apostrophes\' and <brackets>',
                }),
              ],
            }),
          ],
        }),
      ],
    });

    const rules = generateRules(data);
    expect(rules).toHaveLength(1);
    expect(rules[0].action.requestHeaders?.[0].value).toBe(
      'value with "quotes" and \'apostrophes\' and <brackets>'
    );
  });

  it('handles unicode in domain names', () => {
    const data = createData({
      folders: [
        createFolder({
          tabs: [
            createTab({
              requestDomains: 'münchen.de',
              requestHeaders: [createHeaderRule()],
            }),
          ],
        }),
      ],
    });

    const rules = generateRules(data);
    expect(rules[0].condition.requestDomains).toEqual(['münchen.de']);
  });

  it('handles empty strings in header values', () => {
    const data = createData({
      folders: [
        createFolder({
          tabs: [
            createTab({
              requestHeaders: [
                createHeaderRule({ name: 'X-Empty', value: '' }),
              ],
            }),
          ],
        }),
      ],
    });

    const rules = generateRules(data);
    expect(rules).toHaveLength(1);
    expect(rules[0].action.requestHeaders?.[0].value).toBe('');
  });

  it('generates unique IDs across mixed rule types', () => {
    const data = createData({
      folders: [
        createFolder({
          tabs: [
            createTab({
              requestHeaders: [createHeaderRule()],
              responseHeaders: [createHeaderRule({ name: 'Response-Header' })],
              blockedRequests: [createBlockRule()],
              redirectRequests: [createRedirectRule()],
            }),
          ],
        }),
      ],
    });

    const rules = generateRules(data);
    const ids = rules.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(rules.length);
    // IDs should be sequential starting from 1
    expect(ids).toEqual([1, 2, 3, 4]);
  });
});

describe('getChromeVersion', () => {
  it('returns 0 when navigator is undefined', () => {
    // In test environment, navigator may not match Chrome format
    const version = getChromeVersion();
    expect(typeof version).toBe('number');
    expect(version).toBeGreaterThanOrEqual(0);
  });

  it('returns a number', () => {
    expect(typeof getChromeVersion()).toBe('number');
  });
});

describe('isNetworkConditionsSupported', () => {
  it('returns a boolean', () => {
    expect(typeof isNetworkConditionsSupported()).toBe('boolean');
  });

  it('returns false when Chrome version is below 145', () => {
    // getChromeVersion returns 0 in test environment (no Chrome UA)
    // so isNetworkConditionsSupported should return false
    const version = getChromeVersion();
    if (version < 145) {
      expect(isNetworkConditionsSupported()).toBe(false);
    }
  });
});

describe('generateNetworkConditionRules', () => {
  describe('basic functionality', () => {
    it('returns null when data.active is false', () => {
      const data = createData({ active: false });
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('returns null when folders is empty', () => {
      const data = createData({ folders: [] });
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('returns null when data is null/undefined', () => {
      expect(generateNetworkConditionRules(null as any)).toBeNull();
      expect(generateNetworkConditionRules(undefined as any)).toBeNull();
    });

    it('returns null when folders is not an array', () => {
      const data = { active: true, folders: "invalid" } as any;
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('returns null when no network condition rules exist', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [createTab()],
          }),
        ],
      });
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('returns null when network conditions array is empty', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [createTab({ networkConditions: [] })],
          }),
        ],
      });
      expect(generateNetworkConditionRules(data)).toBeNull();
    });
  });

  describe('rule generation', () => {
    it('generates rules for active network conditions', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [createNetworkConditionRule()],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result).not.toBeNull();
      expect(result?.matchedNetworkConditions).toHaveLength(1);
      expect(result?.offline).toBe(false);
    });

    it('skips inactive network condition rules', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ active: false }),
                ],
              }),
            ],
          }),
        ],
      });

      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('skips inactive tabs', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                active: false,
                networkConditions: [createNetworkConditionRule()],
              }),
            ],
          }),
        ],
      });

      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('skips inactive folders', () => {
      const data = createData({
        folders: [
          createFolder({
            active: false,
            tabs: [
              createTab({
                networkConditions: [createNetworkConditionRule()],
              }),
            ],
          }),
        ],
      });

      expect(generateNetworkConditionRules(data)).toBeNull();
    });
  });

  describe('preset values', () => {
    it('applies correct values for slow3g preset', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'slow3g' }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0]).toMatchObject({
        latency: 2000,
        downloadThroughput: 50000,
        uploadThroughput: 50000,
      });
      expect(result?.offline).toBe(false);
    });

    it('applies correct values for slow4g preset', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'slow4g' }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0]).toMatchObject({
        latency: 563,
        downloadThroughput: 180000,
        uploadThroughput: 84375,
      });
      expect(result?.offline).toBe(false);
    });

    it('applies correct values for fast4g preset', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'fast4g' }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0]).toMatchObject({
        latency: 165,
        downloadThroughput: 1012500,
        uploadThroughput: 168750,
      });
      expect(result?.offline).toBe(false);
    });

    it('applies correct values for offline preset', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'offline' }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0]).toMatchObject({
        latency: 0,
        downloadThroughput: 0,
        uploadThroughput: 0,
      });
      expect(result?.offline).toBe(true);
    });

    it('sets offline to true when any rule uses offline preset', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'slow3g' }),
                  createNetworkConditionRule({ preset: 'offline' }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.offline).toBe(true);
      expect(result?.matchedNetworkConditions).toHaveLength(2);
    });
  });

  describe('URL pattern generation', () => {
    it('uses urlFilter directly when provided', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '*://*.example.com/*', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://*.example.com/*');
    });

    it('builds URL pattern from requestDomains when urlFilter is empty', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '', requestDomains: 'example.com' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://example.com/*');
    });

    it('uses tab requestDomains as fallback', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                requestDomains: 'fallback.com',
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://fallback.com/*');
    });

    it('uses wildcard pattern when no filter or domains provided', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://*/*');
    });

    it('uses first domain when multiple domains provided', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '', requestDomains: 'first.com, second.com' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://first.com/*');
    });
  });

  describe('multiple rules', () => {
    it('generates rules from multiple tabs', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [createNetworkConditionRule({ preset: 'slow3g' })],
              }),
              createTab({
                networkConditions: [createNetworkConditionRule({ preset: 'fast4g' })],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions).toHaveLength(2);
    });

    it('generates rules from multiple folders', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [createNetworkConditionRule({ preset: 'slow3g' })],
              }),
            ],
          }),
          createFolder({
            tabs: [
              createTab({
                networkConditions: [createNetworkConditionRule({ preset: 'slow4g' })],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions).toHaveLength(2);
    });

    it('maintains rule order across folders and tabs', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ 
                    preset: 'slow3g',
                    condition: { urlFilter: '*://first.com/*', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ 
                    preset: 'fast4g',
                    condition: { urlFilter: '*://second.com/*', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://first.com/*');
      expect(result?.matchedNetworkConditions[1].urlPattern).toBe('*://second.com/*');
    });
  });

  describe('edge cases', () => {
    it('handles invalid preset gracefully', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({ preset: 'invalid' as any }),
                ],
              }),
            ],
          }),
        ],
      });

      // Invalid preset should be skipped
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('handles missing condition gracefully', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  { active: true, preset: 'slow3g' } as any,
                ],
              }),
            ],
          }),
        ],
      });

      // Missing condition should be skipped
      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('handles null networkConditions array', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: null as any,
              }),
            ],
          }),
        ],
      });

      expect(generateNetworkConditionRules(data)).toBeNull();
    });

    it('strips protocol from requestDomains', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '', requestDomains: 'https://example.com' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://example.com/*');
    });

    it('trims whitespace from urlFilter', () => {
      const data = createData({
        folders: [
          createFolder({
            tabs: [
              createTab({
                networkConditions: [
                  createNetworkConditionRule({
                    condition: { urlFilter: '  *://example.com/*  ', requestDomains: '' },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const result = generateNetworkConditionRules(data);
      expect(result?.matchedNetworkConditions[0].urlPattern).toBe('*://example.com/*');
    });
  });
});