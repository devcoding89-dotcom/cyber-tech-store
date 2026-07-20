import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const connectionString = 'postgresql://postgres:CYBER%20AK890@db.luxoncvjroafxvsylhjh.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    // Find the check constraints on the products table
    console.log('Fetching constraints...');
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'products'::regclass AND contype = 'c';
    `);
    console.log('Constraints found:', res.rows);

    // Drop the category check constraint
    for (const row of res.rows) {
      if (row.pg_get_constraintdef.includes('category')) {
        console.log(`Dropping constraint: ${row.conname}`);
        await client.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS "${row.conname}";`);
      }
    }

    // Add the new check constraint
    console.log('Adding new category constraint...');
    await client.query(`
      ALTER TABLE products 
      ADD CONSTRAINT products_category_check 
      CHECK (category IN ('phones', 'chargers', 'powerbanks', 'accessories'));
    `);
    console.log('✅ New constraint added successfully!');

    // Let's check existing products and delete the ones that have categories 'accounts' or 'cp'
    console.log('Checking existing products...');
    const productsRes = await client.query('SELECT id, name, category FROM products;');
    console.log('Existing products:', productsRes.rows);

    // Delete accounts/cp products if any exist (since we're changing domain)
    const deleteRes = await client.query(`
      DELETE FROM products 
      WHERE category IN ('accounts', 'cp');
    `);
    console.log(`Deleted ${deleteRes.rowCount} products of type 'accounts' or 'cp'.`);

  } catch (error) {
    console.error('❌ Error executing database updates:', error);
  } finally {
    await client.end();
  }
}

run();
