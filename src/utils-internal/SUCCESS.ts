import Success from "../result/Success.ts"

const SUCCESS = <T>(value: T): Success<T> => ({ success: true, value })

export default SUCCESS