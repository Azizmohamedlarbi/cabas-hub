const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    console.log("Fetching ONLY blog_posts table directly...");
    const { data: noRelationData, error } = await supabase
        .from('blog_posts')
        .select('*');

    console.log("No Relation Data:", JSON.stringify(noRelationData, null, 2));
    console.log("No Relation Error:", error);
}

test();
