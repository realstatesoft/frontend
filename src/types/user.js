/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} role
 * @property {string} [avatarUrl]
 * @property {string | null} [suspendedUntil] 
 * @property {string | null} [suspensionReason]
 */

/**
 * @typedef {Object} SuspendUserRequest
 * @property {string | null} suspendedUntil 
 * @property {string} suspensionReason
 */

/**
 * @typedef {'SPAM' | 'COMPORTAMIENTO_INAPROPIADO' | 'INFORMACION_FALSA' | 'ACOSO' | 'FRAUDE' | 'OTRO'} UserReportReason
 */

/**
 * @typedef {Object} CreateUserReportRequest
 * @property {number} reportedUserId
 * @property {UserReportReason} reason
 * @property {string} [description]
 */

/**
 * @typedef {Object} UserReport
 * @property {number} id
 * @property {number} reportedUserId
 * @property {string} reportedUserName
 * @property {number} reporterUserId
 * @property {string} reporterUserName
 * @property {UserReportReason} reason
 * @property {string} [description]
 * @property {string} status
 * @property {string} createdAt
 */

export {};
