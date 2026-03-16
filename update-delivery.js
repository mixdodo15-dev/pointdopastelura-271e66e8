// update-delivery.js
const SUPABASE_URL = "https://naplxylblfnjtvrewkch.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGx4eWxibGZuanR2cmV3a2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjIwMTgsImV4cCI6MjA4NjQzODAxOH0.FOh95Ag1FGpuyb557yCO1S-8PzHpb0V7P2-xByOlpww";

async function run() {
  try {
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/delivery_settings?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    const settings = await getRes.json();
    
    if (!settings || settings.length === 0) {
      console.error('No delivery settings found in database');
      return;
    }

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/delivery_settings?id=eq.${settings[0].id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        base_distance_km: 1,
        base_fee: 5,
        extra_km_fee: 3
      })
    });

    if (patchRes.ok) {
      console.log('✅ Successfully updated delivery settings in Supabase!');
      console.log('New Policy: R$5.00 for the first 1km + R$3.00 for every extra km.');
    } else {
      console.error('❌ Failed to update:', patchRes.status, await patchRes.text());
    }
  } catch (err) {
    console.error('Script Error:', err);
  }
}

run();
