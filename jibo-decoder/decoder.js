const MANUFACTURERS = {
  BO: 'Blue Ocean (manufactured)',
  CC: 'CoreCentric (refurbished)',
};

const COLORS = {
  W: 'White',
  B: 'Black',
};

const MODEL_VERSIONS = {
  '10': 'First Generation',
};

const FUTURE_BLOCKS = {
  '00': 'Standard designation',
};

const COUNTRIES = {
  '00': 'United States (US)',
  '01': 'China',
};

function normalizeInput(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

function stripDashes(value) {
  return value.replace(/-/g, '');
}

function lookup(map, code, label) {
  if (code in map) {
    return { code, label: map[code], known: true };
  }
  return { code, label: `Unknown ${label} (${code})`, known: false };
}

function formatDate(year, month, day) {
  const fullYear = 2000 + year;
  const date = new Date(fullYear, month - 1, day);
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return { fullYear, month, day, formatted };
}

function decodeModelNumber(raw) {
  const normalized = stripDashes(normalizeInput(raw));

  if (!normalized) {
    return { ok: false, error: 'Model number is empty.' };
  }

  const match = normalized.match(/^J([WB])(\d{2})(\d{2})(\d{2})$/);
  if (!match) {
    return {
      ok: false,
      error: 'Model number must match J[Color][Model][Future][Country], e.g. JW100000.',
    };
  }

  const [, colorCode, modelCode, futureCode, countryCode] = match;
  const color = lookup(COLORS, colorCode, 'color');
  const model = lookup(MODEL_VERSIONS, modelCode, 'model version');
  const future = lookup(FUTURE_BLOCKS, futureCode, 'hardware block');
  const country = lookup(COUNTRIES, countryCode, 'country');

  const notes = [];
  if (model.code === '10') {
    notes.push(
      'Units colloquially called "Jibo 1.1" (Tianma displays, updated LED rings) still use the 10 version code for re-certification.',
    );
  }

  return {
    ok: true,
    raw: normalized,
    formatted: `J${colorCode}${modelCode}${futureCode}${countryCode}`,
    color,
    model,
    future,
    country,
    notes,
    summary: `${color.label} · ${model.label} · ${country.label}`,
  };
}

function decodeSerialNumber(raw) {
  const normalized = normalizeInput(raw);
  const compact = stripDashes(normalized);

  if (!compact) {
    return { ok: false, error: 'Serial number is empty.' };
  }

  if (compact.length !== 20) {
    return {
      ok: false,
      error: 'Serial number must be 20 characters (with or without dashes), e.g. BOJW-1000-0017-0212-0001.',
    };
  }

  const manufacturerCode = compact.slice(0, 2);
  const modelPart1 = compact.slice(2, 4);
  const modelPart2 = compact.slice(4, 8);
  const countryAndYear = compact.slice(8, 12);
  const monthDay = compact.slice(12, 16);
  const sequence = compact.slice(16, 20);

  const manufacturer = lookup(MANUFACTURERS, manufacturerCode, 'manufacturer');

  const modelString = `${modelPart1}${modelPart2}${countryAndYear.slice(0, 2)}`;
  const model = decodeModelNumber(modelString);
  if (!model.ok) {
    return {
      ok: false,
      error: `Embedded model block "${modelString}" is invalid: ${model.error}`,
    };
  }

  const year = Number(countryAndYear.slice(2, 4));
  const month = Number(monthDay.slice(0, 2));
  const day = Number(monthDay.slice(2, 4));
  const date = formatDate(year, month, day);

  if (!date) {
    return {
      ok: false,
      error: `Manufacture date ${monthDay} (month/day) with year ${year} is not a valid calendar date.`,
    };
  }

  const sequenceNum = Number(sequence);
  const ordinal = ordinalSuffix(sequenceNum);

  const formattedSerial = [
    compact.slice(0, 4),
    compact.slice(4, 8),
    compact.slice(8, 12),
    compact.slice(12, 16),
    compact.slice(16, 20),
  ].join('-');

  const refurbNote =
    manufacturerCode === 'CC'
      ? 'This unit was refurbished by CoreCentric. The embedded model and date reflect the original build configuration.'
      : null;

  return {
    ok: true,
    raw: normalized,
    formatted: formattedSerial,
    manufacturer,
    model,
    date,
    sequence: {
      code: sequence,
      number: sequenceNum,
      label: `${sequenceNum.toLocaleString()}${ordinal} robot built that day`,
    },
    refurbNote,
    summary: `${manufacturer.label} · ${model.summary} · built ${date.formatted}`,
  };
}

function ordinalSuffix(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function decode(input) {
  const serial = normalizeInput(input.serial);
  const model = normalizeInput(input.model);

  if (serial && model) {
    const serialResult = decodeSerialNumber(serial);
    const modelResult = decodeModelNumber(model);

    if (!serialResult.ok) return serialResult;
    if (!modelResult.ok) return modelResult;

    const serialModel = serialResult.model.formatted;
    const standaloneModel = modelResult.formatted;

    if (serialModel !== standaloneModel) {
      return {
        ok: true,
        type: 'both',
        warning: `Serial embeds model ${serialModel}, but you entered ${standaloneModel}. Showing serial decode; model fields may differ.`,
        serial: serialResult,
        model: modelResult,
      };
    }

    return { ok: true, type: 'both', serial: serialResult, model: modelResult };
  }

  if (serial) {
    const result = decodeSerialNumber(serial);
    if (!result.ok) return result;
    return { ok: true, type: 'serial', serial: result };
  }

  if (model) {
    const result = decodeModelNumber(model);
    if (!result.ok) return result;
    return { ok: true, type: 'model', model: result };
  }

  return { ok: false, error: 'Enter a serial number, model number, or both.' };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    decode,
    decodeSerialNumber,
    decodeModelNumber,
  };
}
