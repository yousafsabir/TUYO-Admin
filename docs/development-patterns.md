# Development Patterns & Standards

This document outlines the mandatory patterns and standards that MUST be followed throughout the application to ensure consistency and prevent errors.

## API Patterns

### 1. Authentication Headers

**ALWAYS use `createAuthHeaders()` for ALL API endpoints**

- ❌ Never manually access `localStorage.getItem("token")` or similar
- ❌ Never hardcode authorization headers
- ✅ Always import and use `createAuthHeaders()` from `lib/api/auth.ts`

\`\`\`typescript
// ❌ WRONG
const token = localStorage.getItem("token")
headers: {
"Authorization": `Bearer ${token}`,
"Content-Type": "application/json"
}

// ✅ CORRECT
import { createAuthHeaders } from "./auth"
headers: createAuthHeaders()
\`\`\`

### 2. API Base URL

**ALWAYS use centralized API configuration**

- ❌ Never hardcode API URLs or create local `API_BASE_URL` constants
- ✅ Always import `API_BASE_URL` from `lib/api/config.ts`

\`\`\`typescript
// ❌ WRONG
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`

// ✅ CORRECT
import { API_BASE_URL } from "./config"
\`\`\`

### 3. Fetch Wrapper

**ALWAYS use `fetchWithNgrok()` for all API calls**

- ❌ Never use native `fetch()` directly
- ✅ Always use `fetchWithNgrok()` from `lib/api/fetch-utils.ts`

### 4. Error Handling Pattern

**Consistent error handling across all API functions**
\`\`\`typescript
try {
const response = await fetchWithNgrok(url, {
headers: createAuthHeaders(),
})

if (!response.ok) {
const errorData = await response.json().catch(() => ({
message: `HTTP error ${response.status}`
}))
throw new Error(errorData.message || "Operation failed")
}

return await response.json()
} catch (error) {
console.error("Error description:", error)
throw error
}
\`\`\`

### 5. FormData Headers

**For FormData requests, remove Content-Type header**
\`\`\`typescript
// For FormData uploads
const headers = createAuthHeaders()
delete headers["Content-Type"] // Let browser set boundary
\`\`\`

## Type Patterns

### 1. API Response Types

**Consistent response type structure**
\`\`\`typescript
export type ApiResponse<T> = {
statusCode: number
status: string
message: string
data: T
}
\`\`\`

### 2. Pagination Types

**Standard pagination structure**
\`\`\`typescript
export type Pagination = {
page: number
limit: number
total: number
}
\`\`\`

## File Organization Patterns

### 1. API Files Structure

\`\`\`
lib/api/
├── config.ts # Centralized API configuration
├── auth.ts # Authentication functions
├── fetch-utils.ts # Fetch wrapper utilities
├── [resource].ts # Individual resource APIs
\`\`\`

### 2. Import Order

1. External libraries
2. Internal utilities (config, auth, fetch-utils)
3. Types and interfaces
4. Component imports

## Component Patterns

### 1. Form Handling

**Always use proper form validation and error handling**

- Use react-hook-form for complex forms
- Implement proper loading states
- Show user-friendly error messages

### 2. Loading States

**Consistent loading state management**

- Use loading indicators for async operations
- Disable buttons during submission
- Provide feedback for user actions

## Security Patterns

### 1. Token Management

**Never expose tokens in logs or errors**

- Use `createAuthHeaders()` to abstract token handling
- Never log authentication headers
- Handle token expiration gracefully

### 2. Input Validation

**Always validate user inputs**

- Client-side validation for UX
- Assume server-side validation exists
- Sanitize data before API calls

## Code Implementation Rules

### 1. Complete File Content

**NEVER use placeholder text in code implementations**

- ❌ Never write "... This file was left out for brevity..."
- ❌ Never use incomplete code blocks
- ✅ Always write complete, functional file content
- ✅ Every line of code must be explicitly written out

### 2. Export Name Consistency

**Maintain consistent export names across the project**

- ❌ Never change existing export names without updating all imports
- ✅ Always check existing files for correct export names before importing
- ✅ Use the same export name pattern as existing similar components

### 3. Follow Existing Patterns Exactly

**Copy patterns from working files, don't improvise**

- ❌ Never create new patterns when existing ones work
- ✅ Always reference working files in the project as templates
- ✅ Copy the exact structure, imports, and error handling from similar working components

### 4. Dictionary Access Patterns

**Simple, safe dictionary access with fallbacks**
\`\`\`typescript
// ❌ WRONG - Deep nesting without fallbacks
dictionary?.navigation?.items?.subscriptions?.title

// ✅ CORRECT - Simple access with fallbacks
dictionary?.navigation?.subscriptions || "Subscriptions"
dictionary?.subscriptions?.title || "Subscriptions"
\`\`\`

### 5. No New Dependencies

**Never introduce new dependencies without explicit approval**

- ❌ Never import libraries not already in package.json
- ❌ Never use external date/utility libraries without checking existing utils
- ✅ Always use existing project utilities and components
- ✅ Ask before adding any new dependencies

### 6. Error Boundaries and Fallbacks

**Always provide fallbacks for dynamic content**
\`\`\`typescript
// ❌ WRONG - No fallbacks

<h1>{dictionary.title}</h1>

// ✅ CORRECT - With fallbacks

<h1>{dictionary?.title || "Default Title"}</h1>
\`\`\`

### 7. Component Structure Consistency

**Follow the exact same structure as existing components**

- Use the same imports order as similar components
- Use the same TypeScript interfaces pattern
- Use the same JSX structure and className patterns
- Use the same error handling and loading states

## Table Component Patterns

### 1. Data Fetching

**Always use React Query with the same pattern**
\`\`\`typescript
const { data, isLoading, error } = useQuery({
queryKey: ["resource-name"],
queryFn: () => fetchResourceFunction(),
})
\`\`\`

### 2. Table Structure

**Follow the existing table component patterns**

- Use the same Table, TableHeader, TableBody components
- Use the same Badge components for status indicators
- Use the same date formatting patterns
- Use the same pagination display patterns

### 3. Loading and Error States

**Consistent loading and error handling in tables**
\`\`\`typescript
if (isLoading) return <div>Loading...</div>
if (error) return <Alert variant="destructive">Error message</Alert>
if (!data?.data) return <div>No data available</div>
\`\`\`

## Checklist for New Components

Before creating any new component, verify:

- [ ] Uses complete file content (no placeholders)
- [ ] Follows existing export name patterns
- [ ] Copies structure from similar working components
- [ ] Uses simple dictionary access with fallbacks
- [ ] No new dependencies introduced
- [ ] Proper error boundaries and fallbacks
- [ ] Consistent with existing component patterns
- [ ] Uses existing API patterns exactly
- [ ] Includes proper TypeScript types
- [ ] Has proper loading and error states

## Common Mistakes to Avoid

1. **Manual token handling** - Always use `createAuthHeaders()`
2. **Hardcoded URLs** - Always use centralized config
3. **Inconsistent error messages** - Follow the standard pattern
4. **Missing loading states** - Always show user feedback
5. **Forgetting FormData headers** - Remove Content-Type for uploads
6. **Direct fetch usage** - Always use the wrapper func
7. **Placeholder Content** - Always write complete file content
8. **Export Name Changes** - Always use existing export name
9. **New Patterns** - Always copy from existing working file
10. **Deep Dictionary Nesting** - Use simple access with fallback
11. **New Dependencies** - Only use what's already available
12. **Missing Fallbacks** - Always provide default values
13. **Inconsistent Structure** - Follow existing component patterns exactly

---

**Remember: These patterns exist to prevent bugs, ensure consistency, and save development time. Always reference this document and existing working files when creating new features. When in doubt, copy from a working similar component rather than creating something new.**

# Development Patterns for Tuyo Admin Panel

This document outlines the development patterns and conventions used in the Tuyo Admin Panel project to ensure consistency and maintainability.

## Project Structure

\`\`\`
app/
├── [lang]/
│ ├── dashboard/
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ ├── admins/
│ │ ├── users/
│ │ ├── products/
│ │ ├── orders/
│ │ └── subscriptions/
│ ├── login/
│ └── layout.tsx
components/
├── ui/ (shadcn components)
├── dashboard/
├── admins/
├── users/
├── products/
├── orders/
├── subscriptions/
└── [feature]/
lib/
├── api/
├── i18n/
├── context/
├── validations/
└── utils/
\`\`\`

## API Layer Patterns

### API Function Structure

All API functions should follow this exact pattern:

\`\`\`typescript
// lib/api/[feature].ts
import { fetchWithNgrok, createAuthHeaders } from './fetch-utils'
import { API_BASE_URL } from './config'

export interface [Feature] {
// Define interface matching API response
}

export interface [Feature]Response {
statusCode: number
status: string
message: string
data: {
[features]: [Feature][]
pagination?: {
page: number
limit: number
total: number
}
}
}

export async function fetch[Features](page: number = 1, limit: number = 25): Promise<[Feature]Response> {
try {
const url = `${API_BASE_URL}/[endpoint]?page=${page}&limit=${limit}`
const headers = createAuthHeaders()

    const response = await fetchWithNgrok(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data

} catch (error) {
console.error('Error fetching [features]:', error)
throw error
}
}
\`\`\`

### Authentication

- Always use `createAuthHeaders()` for authenticated requests
- Use `fetchWithNgrok()` instead of native fetch for API calls
- Import from `./fetch-utils` and `./config`

## Component Patterns

### Table Components

All table components should follow this exact structure:

\`\`\`typescript
// components/[feature]/[feature]-table.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { fetch[Features] } from '@/lib/api/[feature]'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface [Feature]TableProps {
dictionary: any
}

export function [Feature]Table({ dictionary }: [Feature]TableProps) {
const { data, isLoading, error } = useQuery({
queryKey: ['[features]'],
queryFn: () => fetch[Features](1, 25),
})

if (isLoading) {
return (
<div className="flex items-center justify-center p-8">
<Loader2 className="h-8 w-8 animate-spin" />
<span className="ml-2">{dictionary?.common?.loading || 'Loading...'}</span>
</div>
)
}

if (error) {
return (
<Alert variant="destructive">
<AlertDescription>
{dictionary?.common?.error || 'An error occurred while loading data.'}
</AlertDescription>
</Alert>
)
}

const [features] = data?.data?.[features] || []
const pagination = data?.data?.pagination

return (
<div className="space-y-4">
<div className="rounded-md border">
<Table>
<TableHeader>
<TableRow>
{/_ Table headers _/}
</TableRow>
</TableHeader>
<TableBody>
{[features].length === 0 ? (
<TableRow>
<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
{dictionary?.[feature]?.table?.noData || 'No data found'}
</TableCell>
</TableRow>
) : (
[features].map((item) => (
<TableRow key={item.id}>
{/_ Table cells _/}
</TableRow>
))
)}
</TableBody>
</Table>
</div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {dictionary?.[feature]?.table?.showing || 'Showing'} {[features].length} {dictionary?.[feature]?.table?.of || 'of'} {pagination.total} {dictionary?.[feature]?.table?.[features] || 'items'}
          </div>
          <div>
            {dictionary?.[feature]?.table?.page || 'Page'} {pagination.page}
          </div>
        </div>
      )}
    </div>

)
}
\`\`\`

### Page Components

All dashboard pages should follow this structure:

\`\`\`typescript
// app/[lang]/dashboard/[feature]/page.tsx
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/config"
import { [Feature]Table } from "@/components/[feature]/[feature]-table"

interface [Feature]PageProps {
params: {
lang: Locale
}
}

export default async function [Feature]Page({ params }: [Feature]PageProps) {
const dictionary = await getDictionary(params.lang)

return (
<div className="space-y-6">
<div>
<h1 className="text-3xl font-bold tracking-tight">{dictionary?.[feature]?.title || "[Feature]"}</h1>
<p className="text-muted-foreground">
{dictionary?.[feature]?.description || "Manage [feature] data"}
</p>
</div>

      <[Feature]Table dictionary={dictionary} />
    </div>

)
}
\`\`\`

## Internationalization (i18n)

### Dictionary Structure

All dictionary entries should follow this pattern:

\`\`\`json
{
"[feature]": {
"title": "Feature Title",
"description": "Feature description",
"table": {
"field1": "Field 1",
"field2": "Field 2",
"noData": "No data found",
"showing": "Showing",
"of": "of",
"[features]": "items",
"page": "Page"
}
}
}
\`\`\`

### Dictionary Access

Always use simple dictionary access with fallbacks:

\`\`\`typescript
// ✅ Good
dictionary?.feature?.title || "Default Title"

// ❌ Bad - too complex, can fail
dictionary?.feature?.table?.nested?.deep?.value
\`\`\`

## State Management

### React Query

- Use React Query for all API data fetching
- Query keys should be simple arrays: `['users']`, `['products']`
- Always handle loading and error states

### Form State

- Use React Hook Form for complex forms
- Use Zod for validation schemas
- Store validation schemas in `lib/validations/`

## Styling

### Tailwind CSS

- Use Tailwind utility classes
- Follow the existing color scheme
- Use shadcn/ui components when available

### Component Styling

- Prefer composition over custom CSS
- Use consistent spacing: `space-y-4`, `space-y-6`
- Use semantic color classes: `text-muted-foreground`, `bg-card`

## File Naming

### Conventions

- Use kebab-case for file names: `user-table.tsx`
- Use PascalCase for component names: `UserTable`
- Use camelCase for function names: `fetchUsers`

### Directory Structure

- Group related components in feature directories
- Keep API functions in `lib/api/[feature].ts`
- Store types with their related API functions

## Error Handling

### API Errors

\`\`\`typescript
try {
const response = await fetchWithNgrok(url, options)
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`)
}
return await response.json()
} catch (error) {
console.error('Error description:', error)
throw error
}
\`\`\`

### Component Error Boundaries

Always provide fallback UI for error states:

\`\`\`typescript
if (error) {
return (
<Alert variant="destructive">
<AlertDescription>
{dictionary?.common?.error || 'An error occurred'}
</AlertDescription>
</Alert>
)
}
\`\`\`

## TypeScript

### Interface Definitions

- Define interfaces for all API responses
- Use proper typing for component props
- Export interfaces from API files

### Type Safety

- Use `Locale` type for language parameters
- Avoid `any` type except for dictionary props (temporary)
- Use proper generic types for React Query

## Testing Considerations

### Component Testing

- Test components in isolation
- Mock API calls
- Test error states and loading states

### API Testing

- Test API functions with mock responses
- Verify error handling
- Test authentication headers

## Performance

### React Query

- Use appropriate stale times
- Implement proper cache invalidation
- Consider pagination for large datasets

### Component Optimization

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders

## Security

### Authentication

- Always include auth headers for protected routes
- Handle token expiration gracefully
- Redirect to login on auth failures

### Data Validation

- Validate all form inputs
- Sanitize user inputs
- Use proper TypeScript types

## Code Implementation Rules

### 1. Never Use Placeholders

❌ **NEVER DO THIS:**
\`\`\`typescript
// ... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
\`\`\`

✅ **ALWAYS DO THIS:**
Write complete file content with every line of code.

### 2. Export Name Consistency

Before creating or updating components, always check existing export names:

- Check the actual file to see the export name
- Use the exact same export name when importing
- Don't assume export names

### 3. Follow Existing Patterns Exactly

- Copy the exact structure from working files
- Don't improvise or create new patterns
- Use the same imports, same structure, same naming

### 4. Dictionary Access Patterns

✅ **Simple access with fallbacks:**
\`\`\`typescript
dictionary?.feature?.title || "Default Title"
\`\`\`

❌ **Complex nested access:**
\`\`\`typescript
dictionary?.feature?.table?.nested?.deep?.value
\`\`\`

### 5. No New Dependencies

- Only use dependencies that already exist in the project
- Check package.json before using any library
- Use built-in JavaScript/React features when possible

### 6. Error Boundaries and Fallbacks

Always provide fallback values:
\`\`\`typescript
// For dictionary access
{dictionary?.orders?.title || "Orders"}

// For API responses
const orders = data?.data?.orders || []

// For optional fields
{order.shippingCarrier || "N/A"}
\`\`\`

### 7. Component Structure Consistency

Every table component must follow this exact structure:

1. Imports (React Query, API function, UI components)
2. Interface definition
3. Component function with useQuery
4. Loading state
5. Error state
6. Data extraction with fallbacks
7. Helper functions (if needed)
8. Return JSX with table structure

### 8. Table Component Patterns

All table components must include:

- Loading spinner with text
- Error alert with message
- Empty state with proper message
- Pagination information display
- Proper badge variants for status fields
- Date formatting using built-in methods
- Currency formatting for money fields

### 9. Checklist for New Components

Before submitting any new component, verify:

- [ ] Complete file content (no placeholders)
- [ ] Follows existing patterns exactly
- [ ] Uses simple dictionary access with fallbacks
- [ ] Includes proper loading and error states
- [ ] Uses only existing dependencies
- [ ] Has consistent export names
- [ ] Includes proper TypeScript types
- [ ] Follows the same file structure as similar components

### 10. Common Mistakes to Avoid

❌ **Don't do these:**

- Using placeholder text instead of actual code
- Creating complex nested dictionary access
- Adding new dependencies without confirmation
- Assuming export names without checking
- Skipping error handling
- Using inconsistent file naming
- Creating new patterns instead of following existing ones
- Forgetting fallback values for optional data

✅ **Always do these:**

- Write complete, working code
- Copy patterns from existing working files
- Use simple dictionary access with fallbacks
- Include proper error handling
- Check existing export names before importing
- Follow the established file structure exactly
- Test that the implementation matches working components
