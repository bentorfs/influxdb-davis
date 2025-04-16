import { expect, it, vi, describe, beforeEach } from 'vitest';
import { getUserConfig } from './config.js';
import { readFileSync } from 'node:fs';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

describe('getUserConfig', () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
  });

  it('Parses basic config correctly', () => {
    vi.mocked(readFileSync).mockReturnValue(`{
      "meters": [
        { "host": "localhost:1234", "type": "airlink" },
        { "host": "localhost:1235", "type": "weatherlink" }
      ]
    }`);
    expect(getUserConfig()).toEqual({
      meters: [
        {
          host: 'localhost:1234',
          type: 'airlink',
        },
        { host: '123', type: 'weatherlink'},
      ],
    });
  });

});
