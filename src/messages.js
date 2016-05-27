import { appendSuffix } from 'nth'
const nth = (index) => appendSuffix(index + 1)

import { showType, showVal } from './show'

export const errNoNullOrUndefined = 'no null or undefined values allowed'
export const errNotAType = (purportedType) => `not a type: ${purportedType}`
export const errNotACtorTypeArray = (ctorName) => `constructor ${ctorName} must be specified with an array of parameter types`
export const errNumCtorArgs = (numParams, numArgs) => `wrong number of arguments: expected ${numParams} but was ${numArgs}`
export const errBadCtorArg = (arg, argIndex, ctorName, errMsg) => `invalid ${nth(argIndex)} argument ${showVal(arg)} to ${ctorName}: ${errMsg}`
export const errWrongType = (expectedType) => `expected value of type ${showType(expectedType)}`
export const errInvalidCaseName = (caseName, validCases) => `${caseName} is not one of the valid constructors (${validCases.join(', ')}) for this type`
export const errExhaustiveness = (missingCases) => `not all cases handled (missing ${missingCases.join(', ')})`
export const errMissingCase = (caseName) => `failed to handle case ${caseName}`
export const errMissingRecordFields = (missingKeys) => `missing record field${missingKeys.length === 1 ? '' : 's'} ${missingKeys.join(', ')}`
export const errExtraneousRecordFields = (extraKeys) => `extraneous record field${extraKeys.length === 1 ? '' : 's'} ${extraKeys.join(', ')}`
export const errBadRecordFieldValue = (val, key, errMsg) => `value ${showVal(val)} cannot be assigned to field ${key}; ${errMsg}`
export const errAttemptedFieldMutation = 'attempted to modify an immutable record'
export const errGetNonexistentRecordField = (key, validKeys) => `attempted to get ${key} from record { ${validKeys.join(', ')} }`

export const errWrappingNonFunction = (arg) => `attempted to create a checked function from non-function ${showVal(arg)}`
export const errTooManyResultTypes = 'functions can have at most one result type'
export const errNumArgs = (numParams, numArgs) => `wrong number of arguments: expected ${numParams} but was ${numArgs}`
export const errBadArg = (arg, argIndex, errMsg) => `invalid ${nth(argIndex)} argument ${showVal(arg)}; ${errMsg}`
export const errBadResult = (errMsg) => `wrapped function produced invalid result: ${errMsg}`
