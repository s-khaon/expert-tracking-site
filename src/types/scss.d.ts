/**
 * TypeScript declarations for SCSS modules
 * This file allows TypeScript to recognize SCSS imports
 */

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.sass' {
  const content: Record<string, string>
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}