# Business Accounting — Project Context & Development Instructions

## 1. Project Overview

Project name: `business-accounting`

This is a Laravel-based business accounting and management system.

The main goal is to provide business/shop owners with a panel where they can manage:

- Dashboard
- Sales
- Sale Statuses
- Customers
- Customer Documents
- Income
- Expenses
- Operations
- Categories
- Business / Company Information

The long-term goal is to connect external shops and websites to this system through an API.

External shops may use custom websites, custom e-commerce systems, PrestaShop, or other platforms.

The external shop sends its data to our API. Our Laravel backend authenticates the request, identifies the correct business, validates the data, resolves external IDs, creates or updates records, prevents duplicates and cross-business access, and stores synchronized data in MySQL.

**This API integration goal is now COMPLETE.** All planned sync endpoints (Customer, Sales, Payment, Expense, Income, Customer Documents, Business/Company Information) are implemented and tested. See section 20 onward for details.

Architecture:

External Shop
    ↓
Our API
    ↓
Laravel Backend
    ↓
MySQL
    ↓
Accounting Panel
    ↓
Business Owner


## 2. Technology Stack

- PHP
- Laravel
- MySQL
- Laravel Sanctum
- Inertia.js
- React
- TypeScript
- Tailwind CSS
- Laravel Sail
- Docker
- Pest

Development environment:

- Windows
- WSL2 Ubuntu
- Docker Desktop
- Laravel Sail

Project path:

`/home/yusif/projects/business-accounting`

DO NOT use XAMPP.

DO NOT reinstall or recreate the existing environment.

Do not reinstall WSL, Docker, PHP, Composer, or Laravel.


## 3. Important Development Rules

A large part of the application is already implemented.

Do not unnecessarily redesign or rewrite working features.

Before changing an existing feature:

1. Inspect the current implementation.
2. Understand its relationships.
3. Make the smallest safe change.
4. Run the tests.

Do not assume that a file or field exists. Inspect the repository first.

If something cannot be found, tell the developer exactly what is missing.

When the developer asks for "full code", provide the COMPLETE content of the file, not only the changed section.

Keep explanations practical and relatively short.

Preferred workflow:

1. Explain the problem briefly.
2. Explain the reason.
3. Give the exact change.
4. Give the complete file if requested.
5. Give the exact test/request.
6. Wait for the result.
7. Continue to the next task.

### Frontend build requirement — IMPORTANT

There is **no Vite dev server running** in this environment (confirmed: no `public/hot` file, no `vite` process). Every frontend (`.tsx`/`.ts`) change must be followed by:

```bash
./vendor/bin/sail npm run build
```

Skipping this means the browser keeps executing the previously compiled `public/build` bundle, which silently makes JS/TSX edits invisible even though the source is correct. This has already caused one confirmed false bug report (a frontend fix was implemented correctly but appeared "not fixed" because the build was stale). Always rebuild after any `resources/js/**` change, and mention that a rebuild was run when reporting frontend work as done.

Optionally, `./vendor/bin/sail npm run types:check` can be run to catch TypeScript errors — note that as of this writing there are pre-existing, unrelated type errors in `Expenses/Create.tsx`, `Income/Create.tsx`, `Income/Edit.tsx`, and `Operations/Create.tsx` (a `transform` option not recognized by `UseFormSubmitOptions`). These are not caused by the work described in this document and do not block builds (Vite's build does not fail on them).


## 4. Existing Application

The following entities already exist:

- Business
- User
- Customer
- CustomerDocument
- Sale
- SaleStatus
- Payment
- Expense
- Operation
- Category

Most CRUD, validation, authorization and frontend functionality is already implemented.

Business includes:

- business_name
- phone
- email
- address
- website
- tax_id
- currency
- logo_path

Business has Show / Edit / Delete functionality (web), plus a read/update API (see section 24).

Customers have:

- Customer CRUD
- Customer Documents (now supporting PDF, CSV, TXT, JPG, JPEG, PNG, WEBP, GIF, DOCX, XLSX — see section 27)
- delete
- authorization

Operations have:

- list
- filters
- create
- edit
- show
- delete
- categories
- customer relationships
- income/expense
- summary

Expense-type Operations are now also visible in the Expenses section and Dashboard totals (see section 29) — previously they were invisible outside the Operations page.

Sales have:

- Sales
- Customers
- Sale Statuses
- Payments (now using `payment_source`, not `method` — see section 26)
- filters
- CRUD
- authorization

Dashboard, Categories and Sale Statuses are implemented. New Businesses automatically receive three default SaleStatuses (`pending`, `paid`, `cancelled`) on registration — see section 25.


## 5. Test Status

The project currently has:

`120/120 tests passing (427 assertions)`

The frontend also builds successfully via `./vendor/bin/sail npm run build`.

This is an important baseline.

After significant changes always run:

```bash
./vendor/bin/sail artisan test
```

and, if any frontend files changed:

```bash
./vendor/bin/sail npm run build
```

Existing tests must remain passing.

If new tests are added, the total may increase.

Do not break existing functionality.


## 6. Previous Feature Roadmap

The earlier feature roadmap was:

8. Validation + Edge Cases
9. Operations polish
10. Customer Documents
11. Company / Domain information
12. Financial Payment Schedule
13. AI Chatbot

The main parts of these features have already been completed.

AI Chatbot is NOT being implemented at this stage.

Do not spend time implementing AI.

**The API integration phase that followed this roadmap is now COMPLETE** — see section 20 onward.


## 7. API Architecture

The API uses:

`/api/v1/...`

Laravel Sanctum is used for authentication.

Requests use:

`Authorization: Bearer TOKEN`

Sanctum token abilities currently include:

- integration:read
- integration:write

Integration ping and the Business info read endpoint use `integration:read`.

Customer, Sales, Payment, Expense, Income, Customer Document sync, and the Business info update endpoint use `integration:write`.


## 8. Integration Authentication

The following endpoint already exists:

`GET /api/v1/integration/ping`

It has been successfully tested.

It returns data similar to:

```json
{
    "message": "Integration authenticated successfully.",
    "data": {
        "user_id": 1,
        "business_id": 1,
        "business_name": "Based.az"
    }
}
```

This proves:

Token
    ↓
User
    ↓
Business
    ↓
Business-scoped API access

works correctly.


## 9. Multi-Tenant Security Rule

This is a multi-tenant application.

Business isolation is critical.

Every API operation must be scoped to the authenticated user's business.

Never rely only on:

```php
Model::find($id)
```

when processing external API data if that could allow cross-business access.

Always use the authenticated user's:

```php
$businessId = $request->user()->business_id;
```

and scope queries accordingly.

For external IDs, identity should generally be:

`business_id + external_id`

This is one of the most important rules in the project. Every sync endpoint built so far (Customer, Sale, Payment, Expense, Income, Customer Document) follows this pattern. The one exception is Business itself, which is the tenant root — it's identified directly by the token's `business_id`, with no `external_id` concept (see section 24).


## 10. Customer API — COMPLETED

Customer now contains:

`external_id`

Database structure:

- id
- business_id
- external_id
- name
- email
- phone
- timestamps

The external ID represents the customer's ID in the external shop.

Customer identity:

`business_id + external_id`

Different businesses can have the same external_id because business_id is part of the identity.

### Important email constraint decision

The original customers table has a unique constraint involving:

`business_id + email`

We initially attempted to remove it.

MySQL rejected this because the index was required by a foreign key constraint:

`Cannot drop index 'customers_business_id_email_unique': needed in a foreign key constraint`

Therefore:

DO NOT remove the existing email unique constraint unless the database relationships are properly redesigned and verified.

The API also has:

`business_id + external_id`

as a unique constraint.


## 11. Customer Model

Customer `$fillable` includes:

- business_id
- external_id
- name
- email
- phone


## 12. Customer Sync API

Endpoint:

`POST /api/v1/customers`

Example:

```json
{
    "external_id": "shop-customer-001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+994501234567"
}
```

Sync logic:

`business_id + external_id`

If customer does not exist: CREATE.

If customer exists: UPDATE.

First request:

`201 Created` and `created: true`

Same request again:

`200 OK` and `created: false`

This was successfully tested.

A real customer update was also tested successfully. Customer ID remained the same while name/email/phone were updated.

Customer Sync is COMPLETE.

Main files:

- `app/Http/Requests/Api/V1/SyncCustomerRequest.php`
- `app/Services/Api/V1/CustomerSyncService.php`
- `app/Http/Controllers/Api/V1/CustomerController.php`
- `routes/api.php`


## 13. Sales API — COMPLETED

Sales already contained:

`external_id`

Sales contain:

- id
- business_id
- customer_id
- external_id
- amount
- status_id
- sold_at
- timestamps

For API synchronization we added a unique constraint:

`business_id + external_id`


## 14. Sale Sync API

Endpoint:

`POST /api/v1/sales`

Example:

```json
{
    "external_id": "shop-order-001",
    "customer_external_id": "shop-customer-002",
    "amount": 150.50,
    "status_slug": "pending",
    "sold_at": "2026-08-25 16:00:00"
}
```

Meaning:

- external_id = external shop order/sale ID
- customer_external_id = external shop customer ID
- status_slug = sale status slug
- amount = sale amount
- sold_at = sale date/time


## 15. Sale Sync Architecture

The external shop must NOT know our internal database IDs.

Example:

`customer_external_id = shop-customer-002`

is resolved internally using:

`business_id + external_id`

and becomes an internal customer_id.

For sales:

`business_id + external_id`

determines whether the sale already exists.

If not: CREATE.

If yes: UPDATE.

This has already been successfully tested.


## 16. Sale Status Handling

During early testing, the API initially returned:

`The specified sale status does not exist.`

We checked the database and discovered Business #1 had no SaleStatus records. For testing we manually created `pending` (default), `paid`, and `cancelled` statuses to continue Sales API testing.

**This is now fixed permanently.** `app/Actions/Fortify/CreateNewUser.php` — the registration action — now creates all three default SaleStatuses (`pending` is_default=true, `paid`, `cancelled`) inside the same `DB::transaction` as the Business/User creation, so every new Business gets them automatically. This was implemented as an explicit call in that one action (not a model event/Observer), because:

- It's the only real (non-test) place a Business is created in application code.
- This codebase has no existing convention for model events/Observers (none exist anywhere in `app/`), so introducing one would be architecturally inconsistent.
- A `Business::created()` model event would have collided with the `(business_id, slug)` unique constraint on `sale_statuses` in ~13 existing tests that already build their own status set via a local `createStatuses()` helper (`SaleTest.php`, `DashboardTest.php`, `PaymentSyncTest.php`), breaking them with duplicate-key errors.

Covered by `tests/Feature/Auth/RegistrationTest.php::test_registration_creates_default_sale_statuses_for_the_business`.


## 17. Sale Sync Validation

Current validation includes:

```text
external_id:
required|string|max:255

customer_external_id:
nullable|string|max:255

amount:
required|numeric|min:0.01

status_slug:
nullable|string|max:255

sold_at:
nullable|date
```


## 18. Sale Sync Service Behavior

The Sale Sync service:

1. Gets the authenticated user's business ID.
2. If customer_external_id exists, finds the customer within that business.
3. Rejects the request if the customer does not exist.
4. If status_slug exists, finds the status within that business.
5. Rejects the request if the status does not exist.
6. If status_slug is omitted, uses the business's default status.
7. Finds the sale using business_id + external_id.
8. Updates the sale if it exists.
9. Creates the sale if it does not exist.


## 19. Sales API Test Results

Create:

`201 Created`
`created: true`

Update:

`200 OK`
`created: false`

The sale ID remained the same.

Invalid customer test returned:

`422`

with:

```json
{
    "message": "The specified customer does not exist.",
    "errors": {
        "customer_external_id": [
            "The specified customer does not exist."
        ]
    }
}
```

This proves invalid customer references are rejected.

Sales Sync is COMPLETE.


## 20. Payment Sync API — COMPLETED

Payments belong to Sales. The intended architecture was:

External Shop
      ↓
payment external_id
sale external_id
      ↓
Our API
      ↓
business_id
      ↓
Find Sale using:
business_id + sale external_id
      ↓
Resolve internal sale_id
      ↓
Create / Update Payment
      ↓
MySQL
      ↓
Accounting Panel

Endpoint:

`POST /api/v1/payments`

Example:

```json
{
    "external_id": "shop-payment-001",
    "sale_external_id": "shop-order-001",
    "amount": 50.00,
    "payment_source": "cash",
    "paid_at": "2026-08-25 18:00:00"
}
```

`sale_external_id` resolves to an internal `sale_id` via `business_id + external_id` (422 if not found). The payment itself is then found-or-created via `business_id + external_id`. After every create/update, `PaymentService::updateSaleStatus()` recomputes whether the sale is `paid` or `pending` — the same logic the web Payment flow already used.

**Note:** the `method` field was renamed to `payment_source` after this was built — see section 26. `payment_source` is nullable in the sync payload.

Main files:

- `app/Http/Requests/Api/V1/SyncPaymentRequest.php`
- `app/Services/Api/V1/PaymentSyncService.php`
- `app/Http/Controllers/Api/V1/PaymentController.php`
- `database/migrations/2026_08_31_000000_add_sync_fields_to_payments_table.php`

Payment Sync is COMPLETE. Covered by `tests/Feature/Api/V1/PaymentSyncTest.php`.


## 21. Expense Sync API — COMPLETED

Expense is self-contained (like Customer), not cross-referencing another entity the way Payment references Sale.

Endpoint:

`POST /api/v1/expenses`

Example:

```json
{
    "external_id": "shop-expense-001",
    "description": "Office supplies",
    "amount": 75.50,
    "category_name": "Utilities",
    "expense_date": "2026-08-25"
}
```

`category_name` is optional. If provided, it must resolve to an existing `type='expense'` category within the business (422 if not found — categories are never auto-created). If omitted, `category_id` is stored as `null`. The expense itself is found-or-created via `business_id + external_id`.

Main files:

- `app/Http/Requests/Api/V1/SyncExpenseRequest.php`
- `app/Services/Api/V1/ExpenseSyncService.php`
- `app/Http/Controllers/Api/V1/ExpenseController.php`
- `database/migrations/2026_08_31_000001_add_external_id_to_expenses_table.php`

Expense Sync is COMPLETE. Covered by `tests/Feature/Api/V1/ExpenseSyncTest.php`.


## 22. Income Sync API — COMPLETED

**Important architectural note:** there is no dedicated "Income" model or table. Income is purely `Operation` where `type='income'` (the web `IncomeController` is itself just a filtered wrapper around `Operation`/`OperationService`). The sync API mirrors Expense Sync's shape exactly, but writes to `Operation` with `type` hardcoded to `'income'`.

Endpoint:

`POST /api/v1/incomes`

Example:

```json
{
    "external_id": "shop-income-001",
    "description": "Consulting fee",
    "amount": 250,
    "category_name": "Consulting",
    "currency": "AZN",
    "operation_date": "2026-08-25"
}
```

`category_name` (optional) must resolve to an existing `type='income'` category (422 if not found). `currency` defaults to `AZN` if omitted. The `operations` table's `business_id + external_id` unique constraint is shared with Income Sync — the same column also backs any future generic Operation sync, so an `external_id` is unique per business regardless of whether the row is income or expense.

Main files:

- `app/Http/Requests/Api/V1/SyncIncomeRequest.php`
- `app/Services/Api/V1/IncomeSyncService.php`
- `app/Http/Controllers/Api/V1/IncomeController.php`
- `database/migrations/2026_08_31_000002_add_external_id_to_operations_table.php`

Income Sync is COMPLETE. Covered by `tests/Feature/Api/V1/IncomeSyncTest.php`.


## 23. Customer Documents Sync API — COMPLETED

Endpoint:

`POST /api/v1/customer-documents`

This is a **multipart form upload** (not JSON like the other sync endpoints), since it transmits actual file bytes. Fields: `external_id`, `customer_external_id` (resolves to a Customer via `business_id + external_id`, 422 if not found), and `document` (the file).

Re-syncing the same `external_id` **replaces the file**: the old file is deleted from the `public` disk (existence-guarded, same pattern as the web `CustomerDocumentService::delete()`), the new one is stored, and the row is updated — matching the create-or-update convention of every other sync endpoint.

Supported formats: PDF, CSV, TXT, JPG, JPEG, PNG, WEBP, GIF, DOCX, XLSX (max 10 MB) — see section 27 for the format expansion history.

Main files:

- `app/Http/Requests/Api/V1/SyncCustomerDocumentRequest.php`
- `app/Services/Api/V1/CustomerDocumentSyncService.php`
- `app/Http/Controllers/Api/V1/CustomerDocumentController.php`
- `database/migrations/2026_08_31_000003_add_external_id_to_customer_documents_table.php`

Customer Documents Sync is COMPLETE. Covered by `tests/Feature/Api/V1/CustomerDocumentSyncTest.php` (uses `Storage::fake('public')` + `UploadedFile::fake()`).


## 24. Business / Company Information API — COMPLETED

**Architecturally different from every other sync endpoint.** A Business is not created or referenced by an external shop — every Sanctum token already belongs to exactly one Business via `$request->user()->business_id`, exactly like `/integration/ping` already demonstrated. So there is no `external_id` concept and no create-or-update branching — just read/update the caller's own already-identified business.

Endpoints:

`GET /api/v1/business` (under `integration:read`, alongside `ping`) — returns the caller's business (`business_name`, `phone`, `email`, `address`, `website`, `tax_id`, `currency`, `logo_path`, etc.)

`PUT /api/v1/business` (under `integration:write`) — updates `business_name` (required), `phone`, `email`, `address`, `website`, `tax_id`, `currency` (nullable except business_name/currency; `currency` restricted to `AZN|USD|EUR|GBP`).

**`logo` is deliberately excluded** from this API — it stays a web-UI-only feature via the existing `BusinessController` (multipart upload with delete-old-then-store-new). Adding it here would need the same multipart handling as Customer Documents, which wasn't judged necessary for v1.

Main files:

- `app/Http/Requests/Api/V1/UpdateBusinessInfoRequest.php`
- `app/Http/Controllers/Api/V1/BusinessController.php` (`show()`, `update()`)

Business Info API is COMPLETE. Covered by `tests/Feature/Api/V1/BusinessInfoTest.php` (read, update, validation, auth/ability checks, cross-business isolation).


## 25. Default SaleStatus Creation on Registration — COMPLETED

See section 16 for full detail. Summary: `app/Actions/Fortify/CreateNewUser.php` now creates `pending`/`paid`/`cancelled` SaleStatus rows for every new Business at registration time, inside the same transaction as Business/User creation. No model events/Observers were introduced (none exist anywhere in this codebase). Covered by a new test in `tests/Feature/Auth/RegistrationTest.php`.


## 26. Payment Source Rename (Breaking Change) — COMPLETED

The `payments.method` column (and its `cash|card|bank_transfer` enum, both web and API) has been **renamed to `payment_source`** with a new value set: `cart2cart`, `cash`, `company_bank_account`, `deposit`. `card` and `bank_transfer` no longer exist as values.

This is an intentional breaking change. Any external integration sending `method: cash|card|bank_transfer` must switch to `payment_source: cart2cart|cash|company_bank_account|deposit`.

Changed:

- Migration: `database/migrations/2026_08_31_000004_rename_method_to_payment_source_on_payments_table.php` (raw `ALTER TABLE ... CHANGE`, same VARCHAR(255) NULL type — no `doctrine/dbal` dependency needed)
- `app/Models/Payment.php`, `app/Services/PaymentService.php`, `app/Services/Api/V1/PaymentSyncService.php`
- `app/Http/Requests/StorePaymentRequest.php`, `app/Http/Requests/Api/V1/SyncPaymentRequest.php`
- `resources/js/pages/Payments/Create.tsx` (form field + select options), `resources/js/pages/Sales/Show.tsx` (display labels via an explicit `PAYMENT_SOURCE_LABELS` map, replacing a `.replace('_',' ')` + CSS-capitalize hack that would have mangled `company_bank_account` and `cart2cart`)
- `tests/Feature/SaleTest.php`, `tests/Feature/Api/V1/PaymentSyncTest.php`

**Known stale leftover (not yet cleaned up):** `tests/Feature/DashboardTest.php` still passes `'method' => 'cash'`/`'card'` to `Payment::create()` in its setup — harmless since `method` isn't in `Payment`'s fillable anymore (silently dropped, doesn't affect the `amount`-based assertions), but worth fixing whenever that file is next touched.


## 27. Customer Document Format Expansion — COMPLETED

Added support for **webp, gif, docx, xlsx, txt** alongside the existing pdf, csv, jpg, jpeg, png (all web + API validation now: `mimes:pdf,csv,jpg,jpeg,png,webp,gif,docx,xlsx,txt|max:10240`).

Four request classes share this list and were all updated: `StoreCustomerDocumentRequest`, `Api/V1/SyncCustomerDocumentRequest`, `StoreCustomerRequest` (Customer Create's `documents.*`), `UpdateCustomerRequest` (Customer Edit's `documents.*`).

Preview behavior (`app/Http/Controllers/CustomerDocumentController.php::preview()`):

- Images (jpg/png/webp/gif) and PDF render inline as before.
- TXT renders inline via the same iframe approach as PDF.
- DOCX/XLSX **cannot** render inline in a browser — `preview()` now explicitly forces `Content-Disposition: attachment` for those two mimes.

Frontend (`resources/js/components/customer-documents.tsx`): new `isText()`/`isDocx()`/`isXlsx()`/`isOfficeDocument()`/`documentTypeLabel()` helpers; the preview modal gained a TXT branch and a DOCX/XLSX "no preview available — download" state; a pre-existing bug where the list-item icon fallback always showed literal `'CSV'` for any non-image/PDF file was fixed as part of this same change (it would have gotten worse with more formats).

Covered by `tests/Feature/Api/V1/CustomerDocumentSyncTest.php` (a `#[DataProvider]`-driven test — note PHPUnit 10+ in this project requires the `#[DataProvider]` attribute, not the `@dataProvider` docblock).


## 28. Multi-Document Upload Fix — COMPLETED

Bug: in both Customer Create and Customer Edit, selecting a file, then reopening the native file picker and selecting another file, replaced the first selection instead of accumulating both. Root cause was in `handleFilesChange` in `resources/js/pages/Customers/Create.tsx` and `resources/js/pages/Customers/Edit.tsx`: it replaced `selectedFiles` state with only the newly-picked files each time, instead of appending. Fixed by merging new selections into the existing array and resetting the input's value after each pick.

**Important lesson from this task:** the first fix attempt was source-code-correct but the developer still saw the bug, because the frontend assets hadn't been rebuilt (see the "Frontend build requirement" rule in section 3) — `public/build` was several days stale with no Vite dev server running. Always rebuild (`./vendor/bin/sail npm run build`) after frontend changes before considering a fix verified.


## 29. Operations → Expenses / Dashboard Integration — COMPLETED

**Root cause:** `Expense` (standalone model/table) and `Operation` (type=`expense`) were two fully independent, unconnected data stores with no foreign key or shared column between them. An expense created via the Operations UI was written only to `operations`; the Expenses page and Dashboard both read only from `expenses` — structurally invisible to each other. The Dashboard had the identical blind spot (it already summed `Operation` for income, but not for expenses).

**Fix (merge, not dual-write):** rather than making Operation-expense-creation also write a duplicate `Expense` row (which risked double-counting if Dashboard were ever fixed independently), both read paths now merge the two sources:

- `app/Services/ExpenseService.php` — `getExpensesForCurrentBusiness()`/`getExpenseSummary()` fetch both `Expense` and `Operation(type='expense')` under the same filters, normalize each into a common shape (`id`, `source: 'expense'|'operation'`, `description`, `amount`, `category`, `expense_date`), merge, sort, and paginate **in memory** (a DB-level `UNION` across two differently-shaped Eloquent models wasn't practical; acceptable given typical expense volumes for this app).
- `app/Services/DashboardService.php` — expense totals, the 6-month `monthlyOverview`, and `getRecentExpenses()` all now include `Operation::where('type','expense')` alongside `Expense::`, mirroring how income already summed `Operation::where('type','income')`.
- Frontend (`resources/js/pages/Expenses/Index.tsx`, `resources/js/pages/dashboard.tsx`): merged rows carry a `source` field. Operation-sourced rows in the Expenses list get an "Operation" badge, their Edit link routes to `/operations/{id}/edit` (not `/expenses/{id}/edit` — the ids are from different tables and would otherwise resolve to the wrong record or 404), and their Delete action is replaced with "Managed in Operations" text since deleting via the Expense route can't act on an Operation row.

No schema changes, no dual-write, no double-counting. Covered by new tests in `tests/Feature/ExpenseTest.php` and `tests/Feature/DashboardTest.php`.


## 30. Postman

Use Postman for API testing from now on.

Avoid repeatedly using long curl commands unless necessary.

Prefer Postman environment variables:

```text
{{base_url}}
{{api_token}}
```

Examples:

```text
{{base_url}}/api/v1/customers
{{base_url}}/api/v1/sales
{{base_url}}/api/v1/payments
{{base_url}}/api/v1/expenses
{{base_url}}/api/v1/incomes
{{base_url}}/api/v1/customer-documents
{{base_url}}/api/v1/business
```

Authorization:

`Bearer Token`

The API should eventually have a proper Postman Collection.


## 31. Current API Routes

Current API structure (all under `Route::prefix('v1')`, `auth:sanctum`):

```text
POST /api/v1/login
POST /api/v1/logout
GET  /api/v1/user

GET  /api/v1/integration/ping          (abilities:integration:read)
GET  /api/v1/business                  (abilities:integration:read)

POST /api/v1/customers                 (abilities:integration:write)
POST /api/v1/sales                     (abilities:integration:write)
POST /api/v1/payments                  (abilities:integration:write)
POST /api/v1/expenses                  (abilities:integration:write)
POST /api/v1/incomes                   (abilities:integration:write)
POST /api/v1/customer-documents        (abilities:integration:write)
PUT  /api/v1/business                  (abilities:integration:write)
```

Do not unnecessarily modify working routes.


## 32. Current Development Status

Completed:

```text
Integration Authentication       ✅
Integration Ping                 ✅

Customer Sync                    ✅
Sale Sync                        ✅
Payment Sync                     ✅
Expense Sync                     ✅
Income Sync                      ✅
Customer Documents Sync          ✅
Business / Company Information   ✅ (read + update)

Default SaleStatus on register   ✅
Payment Source rename            ✅
Customer Document format expand  ✅
Multi-document upload fix        ✅
Operations → Expenses/Dashboard  ✅
```

Existing test suite:

`120/120 passing (427 assertions)`

Frontend build: passing (`./vendor/bin/sail npm run build`).

**There is no mandated "current task" right now.** All items from the original API roadmap (section 6) and the tracked follow-up work are complete. See section 34 for optional future ideas.


## 33. Important API Design Principle

External IDs are the integration boundary.

External systems should use their own IDs.

Our database uses internal IDs internally.

Example:

External:

`shop-order-001`

Our database:

`sale_id = 1`

The external shop only knows:

`shop-order-001`

Our API performs the mapping.

This principle has been preserved throughout every sync integration built (Customer, Sale, Payment, Expense, Income, Customer Document). The one deliberate exception is Business itself (see section 24), which has no `external_id` because it's the tenant root identified directly by the token.


## 34. Future API Roadmap

All originally planned integrations are complete:

```text
Integration Authentication       ✅
Customer Sync                    ✅
Sales Sync                       ✅
Payment Sync                     ✅
Expense Sync                     ✅
Income Sync                      ✅
Customer Documents Sync          ✅
Business / Company Information   ✅
```

Potential future work (none currently prioritized or requested):

```text
Generic Operation Sync (a unified endpoint accepting type=income|expense,
  as an alternative/complement to the separate Income/Expense endpoints)
Category Sync
DB-level (rather than in-memory) merged pagination for Expenses,
  if expense/operation volume ever grows large enough to matter
Cleaning up the stale 'method' key in DashboardTest.php (section 26)
```

The exact order, if any of this is picked up, should be decided with the developer — do not start on these unprompted.


## 35. Database Reset Warning

Be careful with:

```bash
./vendor/bin/sail artisan migrate:fresh
```

This drops all tables and deletes all current data.

Use it only when explicitly needed.

Do not use it casually during API development. (It has not been used for any of the work described in this document — every schema change was an additive migration.)


## 36. Git Workflow

The project is stored in GitHub.

Repository:

`yusif-cpu/business-accounting`

The project has already been pushed to GitHub.

Before making major changes:

- inspect the existing code
- make focused changes
- run tests
- verify functionality

Do not overwrite working functionality without a reason.


## 37. Working Style

The developer prefers fast, practical progress.

Avoid unnecessary long explanations.

For each task:

1. Inspect the existing implementation.
2. Identify exactly what is needed.
3. Explain briefly.
4. Provide complete code when requested.
5. Provide the exact command/test.
6. Wait for the result.
7. Move to the next task.

When the developer says:

"full code"

provide the entire file.

When the developer says:

"continue"

continue from the current project state instead of restarting.

The established pattern for larger features has been: investigate and report first (root cause, current behavior, affected files, options/concerns) without making changes, let the developer confirm the approach (sometimes via explicit choices), and only implement after an explicit go-ahead in a separate message.


## 38. Do Not Reinstall Anything

The environment is already working.

DO NOT:

- reinstall Laravel
- reinstall PHP
- reinstall Docker
- reinstall WSL
- recreate the project
- use XAMPP
- create a second project

Work directly inside:

`/home/yusif/projects/business-accounting`


## 39. Final Product Architecture

The final concept is:

                    EXTERNAL SHOPS
                          │
                          │ API
                          ↓
                ┌──────────────────┐
                │   Laravel API    │
                │                  │
                │ Sanctum          │
                │ Validation       │
                │ Business Scope   │
                │ Sync Services    │
                └────────┬─────────┘
                         ↓
                      MySQL
                         ↓
                 Accounting Panel
                         ↓
                   Business Owner

External shops send data.

Our API:

- authenticates the request
- identifies the business
- validates the data
- resolves external IDs
- creates or updates records
- prevents duplicates
- prevents cross-business access
- stores the data in MySQL

The accounting panel then displays the synchronized data.

**This architecture is now fully realized** — every planned entity (Customer, Sale, Payment, Expense, Income, Customer Document, Business info) has a working sync/read endpoint following this exact flow.


## 40. Session Continuation

There is no pending "immediate next action" — see section 32. When picking up work in a new session:

1. Re-read this file for current state.
2. Run `./vendor/bin/sail artisan test` to confirm the 120/120 baseline still holds.
3. If the developer requests new work, follow the investigate-first pattern described in section 37: inspect, report root cause/options, wait for confirmation, then implement.
4. If touching `resources/js/**`, always run `./vendor/bin/sail npm run build` afterward (section 3) before reporting the work as done.
5. Do not use `migrate:fresh` (section 35).
