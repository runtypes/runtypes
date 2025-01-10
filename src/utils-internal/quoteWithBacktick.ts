const quoteWithBacktick = (string: string): string => `\`${string.replaceAll("`", "\\`")}\``

export default quoteWithBacktick