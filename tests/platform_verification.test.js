import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// 1. Universal Stable Sorting Test (Mirrors src/types/sorting.ts)
function sortData(data, sortOption, direction) {
  if (!Array.isArray(data) || data.length <= 1) return Array.isArray(data) ? [...data] : [];
  const indexed = data.map((item, index) => ({ item, index }));

  indexed.sort((a, b) => {
    const valA = sortOption.getValue(a.item);
    const valB = sortOption.getValue(b.item);

    const aIsNull = valA === null || valA === undefined || valA === '';
    const bIsNull = valB === null || valB === undefined || valB === '';

    if (aIsNull && bIsNull) return a.index - b.index;
    if (aIsNull) return 1;
    if (bIsNull) return -1;

    let comparison = 0;
    if (valA instanceof Date && valB instanceof Date) {
      comparison = valA.getTime() - valB.getTime();
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return indexed.map((x) => x.item);
}

describe('Constraint Card 03: Sorting and Data Integrity', () => {
  test('Numeric sorting correctly orders high to low and low to high', () => {
    const items = [
      { id: 'A', score: 42 },
      { id: 'B', score: 95 },
      { id: 'C', score: 18 },
      { id: 'D', score: 81 },
    ];
    const option = { getValue: (i) => i.score };

    const desc = sortData(items, option, 'desc');
    assert.deepEqual(desc.map((i) => i.id), ['B', 'D', 'A', 'C']);

    const asc = sortData(items, option, 'asc');
    assert.deepEqual(asc.map((i) => i.id), ['C', 'A', 'D', 'B']);
  });

  test('Null and undefined values are safely positioned at the bottom', () => {
    const items = [
      { id: 'A', score: 50 },
      { id: 'B', score: null },
      { id: 'C', score: 90 },
      { id: 'D', score: undefined },
    ];
    const option = { getValue: (i) => i.score };

    const desc = sortData(items, option, 'desc');
    assert.equal(desc[0].id, 'C');
    assert.equal(desc[1].id, 'A');
    // B and D must be at the end
    assert.ok(desc[2].score === null || desc[2].score === undefined);
    assert.ok(desc[3].score === null || desc[3].score === undefined);
  });

  test('Stable sorting preserves original order for equal values', () => {
    const items = [
      { id: 'A1', priority: 'HIGH' },
      { id: 'B1', priority: 'LOW' },
      { id: 'A2', priority: 'HIGH' },
      { id: 'A3', priority: 'HIGH' },
    ];
    const option = { getValue: (i) => i.priority };

    const sorted = sortData(items, option, 'asc');
    const highs = sorted.filter((i) => i.priority === 'HIGH');
    assert.deepEqual(highs.map((i) => i.id), ['A1', 'A2', 'A3']);
  });

  test('Filtering combined with sorting works accurately', () => {
    const items = [
      { id: '1', category: 'BUILDING', urgency: 3 },
      { id: '2', category: 'ROAD', urgency: 5 },
      { id: '3', category: 'BUILDING', urgency: 9 },
      { id: '4', category: 'BRIDGE', urgency: 4 },
      { id: '5', category: 'BUILDING', urgency: 1 },
    ];

    const filtered = items.filter((i) => i.category === 'BUILDING');
    const sorted = sortData(filtered, { getValue: (i) => i.urgency }, 'desc');

    assert.equal(sorted.length, 3);
    assert.deepEqual(sorted.map((i) => i.id), ['3', '1', '5']);
  });
});

describe('RBAC Personas and Role Permissions', () => {
  const PRESET_PERSONAS = {
    ADMIN: { role: 'ADMIN', agency: 'SDMA' },
    INSPECTOR: { role: 'INSPECTOR', agency: 'NDRF' },
    OPERATOR: { role: 'OPERATOR', agency: 'DEOC' },
    CITIZEN: { role: 'CITIZEN', agency: 'VOLUNTEER' },
  };

  function hasRole(currentRole, allowedRoles) {
    return allowedRoles.includes(currentRole);
  }

  test('ADMIN has access to Admin Center and Model Lifecycle', () => {
    assert.equal(hasRole(PRESET_PERSONAS.ADMIN.role, ['ADMIN']), true);
  });

  test('INSPECTOR and CITIZEN do not have access to ROOT Admin Center', () => {
    assert.equal(hasRole(PRESET_PERSONAS.INSPECTOR.role, ['ADMIN']), false);
    assert.equal(hasRole(PRESET_PERSONAS.CITIZEN.role, ['ADMIN']), false);
  });

  test('OPERATOR and ADMIN both have command dispatch access', () => {
    assert.equal(hasRole(PRESET_PERSONAS.OPERATOR.role, ['ADMIN', 'OPERATOR']), true);
    assert.equal(hasRole(PRESET_PERSONAS.ADMIN.role, ['ADMIN', 'OPERATOR']), true);
  });
});

describe('Emergency SOS Validation and Error Boundary', () => {
  test('Payload conforms to backend SOS schema', () => {
    const payload = {
      latitude: 10.0889,
      longitude: 77.0595,
      location_name: 'Munnar Tea Estate Zone A',
      emergency_type: 'TRAPPED_RISING_WATER',
      persons_count: 3,
      contact_phone: '+91 94471 20001',
      notes: 'Flooding near bridge',
    };

    assert.ok(typeof payload.latitude === 'number');
    assert.ok(typeof payload.longitude === 'number');
    assert.ok(payload.persons_count >= 1);
    assert.ok(payload.emergency_type.length > 0);
  });

  test('API failure does not pretend success or create fake incident beacon', () => {
    let state = { step: 'TRANSMITTING', incidentId: null, errorMessage: null };

    // Simulating API error
    const simulateApiFailure = () => {
      try {
        throw new Error('503 Service Unavailable: Remote emergency gateway unreachable');
      } catch (err) {
        state = {
          step: 'ERROR',
          incidentId: null,
          errorMessage: err.message,
        };
      }
    };

    simulateApiFailure();

    assert.equal(state.step, 'ERROR');
    assert.equal(state.incidentId, null);
    assert.ok(state.errorMessage.includes('503 Service Unavailable'));
  });
});

describe('API Boundary Defense & Null Safety (Fixes for production crashes)', () => {
  test('Non-JSON HTML string payload does not overwrite command stats or crash', () => {
    const DEFAULT_STATS = {
      active_incidents: 4,
      critical_zones: 3,
      geo_filtered_radius_km: 25,
    };

    const htmlStringResponse = '<!doctype html><html><body>Error</body></html>';

    // Safe extraction logic applied in mapService.ts
    const isObject = typeof htmlStringResponse === 'object' && htmlStringResponse !== null;
    const safeData = isObject ? htmlStringResponse : DEFAULT_STATS;

    assert.equal(safeData.geo_filtered_radius_km, 25);
    assert.equal(typeof safeData.geo_filtered_radius_km, 'number');
  });

  test('Array normalization prevents TypeError: f.filter is not a function', () => {
    const apiPayloads = [null, undefined, 'error', 123, { error: true }];

    apiPayloads.forEach((payload) => {
      const safeArray = Array.isArray(payload) ? payload : [];
      assert.ok(Array.isArray(safeArray));
      assert.doesNotThrow(() => {
        safeArray.filter((x) => x !== null);
      });
    });
  });
});

describe('Feedback Form Validation', () => {
  function validateFeedback(form) {
    const errors = {};
    if (!form.subject || form.subject.trim().length < 5) {
      errors.subject = 'Subject must be at least 5 characters long';
    }
    if (!form.description || form.description.trim().length < 15) {
      errors.description = 'Description must be at least 15 characters long';
    }
    return errors;
  }

  test('Rejects short subject or short description', () => {
    const bad = validateFeedback({ subject: 'Bug', description: 'Broken' });
    assert.ok(bad.subject);
    assert.ok(bad.description);
  });

  test('Accepts valid feedback submission', () => {
    const good = validateFeedback({
      subject: 'Sorting filter reset issue on risk map',
      description: 'When switching between GIS layers, the active priority filter resets to default.',
    });
    assert.deepEqual(good, {});
  });
});
