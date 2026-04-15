/**
 * @typedef {Object} PreferenceOption
 * @property {number} id
 * @property {string} label
 * @property {string} value
 * @property {string} categoryCode
 */

/**
 * @typedef {Object} PreferenceCategory
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {PreferenceOption[]} options
 */

/**
 * @typedef {'PRICE' | 'SURFACE' | 'BEDROOMS'} RangeFieldName
 */

/**
 * @typedef {Object} RangePreference
 * @property {RangeFieldName} fieldName
 * @property {number | null} minValue
 * @property {number | null} maxValue
 */

/**
 * @typedef {Object} UserPreferenceRequest
 * @property {number} userId
 * @property {number[]} selectedOptionIds
 * @property {RangePreference[]} ranges
 */

/**
 * @typedef {Object} UserPreferenceResponse
 * @property {number} userId
 * @property {boolean} onboardingCompleted
 * @property {PreferenceOption[]} selectedOptions
 * @property {RangePreference[]} ranges
 */

export {};
