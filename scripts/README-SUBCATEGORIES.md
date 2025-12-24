# 📂 Sub-Categories Seeding Script

## What This Does

This script adds sub-categories to all your categories so that when vendors create services, they have sub-categories to choose from.

## Categories Covered

The script will add sub-categories for:
- ✅ Beauty & Wellness (8 sub-categories)
- ✅ Salon for Men (6 sub-categories)
- ✅ Salon for Women (6 sub-categories)
- ✅ Appliance Repair & Service (7 sub-categories)
- ✅ Electrician, Plumber & Carpenters (6 sub-categories)
- ✅ Home Services (6 sub-categories)
- ✅ Cleaning (6 sub-categories)
- ✅ Health & Medical (6 sub-categories)
- ✅ Automotive (6 sub-categories)
- ✅ Bathroom & Kitchen Cleaning (5 sub-categories)
- ✅ Food & Catering (4 sub-categories)

**Total: 66 sub-categories**

## How to Run

### Step 1: Open Terminal
Open your terminal in the project directory:
```bash
cd D:\connect-platform
```

### Step 2: Run the Script
```bash
node scripts/seed-subcategories.js
```

### Step 3: Check Output
You should see output like:
```
🌱 Starting sub-category seeding...

📂 Processing: Beauty & Wellness
   ✅ Makeup - added
   ✅ Hair Styling - added
   ✅ Spa Services - added
   ...

📂 Processing: Salon for Men
   ✅ Men's Haircut - added
   ✅ Shaving & Grooming - added
   ...

============================================================
🎉 Seeding Complete!

   ✅ Added: 66 sub-categories
   ⏭️  Skipped: 0 (already exist)
   ❌ Errors: 0
============================================================

📊 Summary by Category:

   Beauty & Wellness: 8 sub-categories
   Salon for Men: 6 sub-categories
   ...

✅ All done! You can now use these sub-categories in your service creation form.
```

## After Running

1. **Refresh your service creation page**
2. **Select a category** (e.g., "Salon for Men")
3. **You'll now see sub-categories** in the dropdown!

## If You Get Errors

### Error: "Category not found"
This means the category slug in the script doesn't match your database. To fix:

1. Check your category slugs:
   ```bash
   node scripts/check-categories.js
   ```

2. Update the `categorySlug` values in `seed-subcategories.js` to match your actual slugs

### Error: "Unique constraint failed"
This means some sub-categories already exist. That's okay! The script will skip them.

### Error: "Cannot find module '@prisma/client'"
Run:
```bash
npm install
npx prisma generate
```

## Verify It Worked

### Option 1: Check in Browser
1. Go to `/vendor/services/add`
2. Select a category
3. Check if sub-categories appear in dropdown

### Option 2: Check in Database
Open Beekeeper Studio and run:
```sql
SELECT 
  c.name as Category,
  sc.name as SubCategory,
  sc.slug
FROM SubCategory sc
JOIN Category c ON sc.categoryId = c.id
ORDER BY c.name, sc.name;
```

### Option 3: Run Verification Script
```bash
node scripts/verify-subcategories.js
```

## Customization

Want to add more sub-categories? Edit `seed-subcategories.js`:

```javascript
{
  categorySlug: 'cat-your-category',
  subcategories: [
    { id: 'sub-custom', name: 'Custom Sub', slug: 'custom-sub' },
    // Add more...
  ]
}
```

Then run the script again. It won't duplicate existing ones!

## What Gets Added

Each sub-category includes:
- ✅ Unique ID
- ✅ Name (display name)
- ✅ Slug (URL-friendly)
- ✅ Link to parent category
- ✅ Active status (enabled by default)

## Troubleshooting

**Problem:** Script runs but categories still show "No sub-categories"

**Solutions:**
1. Hard refresh browser (Ctrl + Shift + R)
2. Check if category IDs match
3. Verify sub-categories were actually created:
   ```sql
   SELECT COUNT(*) FROM SubCategory;
   ```

**Problem:** "Cannot find module"
```bash
npm install
```

**Problem:** Database connection error
- Check `.env` file has correct `DATABASE_URL`
- Make sure database is running

## Safe to Run Multiple Times

✅ The script is **idempotent** - it won't create duplicates
✅ If a sub-category already exists, it will skip it
✅ You can run it as many times as needed

## Next Steps

After running the script:
1. ✅ Refresh your service creation page
2. ✅ Select any category
3. ✅ Choose from available sub-categories
4. ✅ Create your service!

## Need Help?

- Check console output for error messages
- Verify database connection
- Make sure Prisma is set up: `npx prisma generate`
