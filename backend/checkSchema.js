require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  await supabase.from('issue_photos').delete().eq('photo_url', 'https://test.com/photo.jpg');
}

fix();
