const quoteWithDoubleQuote = (string: string): string => `"${string.replaceAll('"', '\\"')}"`

export default quoteWithDoubleQuote