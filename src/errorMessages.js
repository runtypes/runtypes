import { showType, showVal } from './util'

export const errNoNullOrUndefined = 'no null or undefined values allowed'
export const errNotAType = (purportedType) => `not a type: ${purportedType}`
export const errNotACtorTypeArray = (ctorName) => `constructor ${ctorName} must be specified with an array of parameter types`
export const errNumCtorArgs = (numParams, numArgs) => `wrong number of arguments: expected ${numParams} but was ${numArgs}`
export const errBadCtorArg = (arg, argIndex, ctorName, errMsg) => `value ${showVal(arg)} cannot be passed as argument ${argIndex} of constructor ${ctorName}; ${errMsg}`
export const errWrongType = (expectedType) => `expected value of type ${showType(expectedType)}`
export const errInvalidCaseName = (caseName, validCases) => `${caseName} is not one of the valid constructors for this type (${validCases.join(', ')})`
export const errExhaustiveness = (missingCases) => `not all cases handled (missing ${missingCases.join(', ')})`
export const errMissingCase = (caseName) => `failed to handle case ${caseName}`
export const errMissingRecordFields = (missingKeys) => `missing record field${missingKeys.length === 1 ? '' : 's'} ${missingKeys.join(', ')}`
export const errExtraneousRecordFields = (extraKeys) => `extraneous record field${extraKeys.length === 1 ? '' : 's'} ${extraKeys.join(', ')}`
export const errBadRecordFieldValue = (val, key, errMsg) => `value ${showVal(val)} cannot be assigned to field ${key}; ${errMsg}`
export const errAttemptedFieldMutation = 'attempted to modify an immutable record'
export const errGetNonexistentRecordField = (key, validKeys) => `attempted to get ${key} from record { ${validKeys.join(', ')} }`
