// Console Debug Script for Quarterback Database Issues
// Copy and paste this into your browser console while on the Quarterback app

console.log('🔍 Starting Quarterback Database Debug...');

// Step 1: Check if Supabase is available
async function debugDatabase() {
    try {
        // Import Supabase
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        
        // Get environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('📋 Environment Variables:');
        console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
        console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Missing Supabase environment variables');
            return;
        }
        
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Step 2: Test connection
        console.log('\n🔌 Testing Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (connectionError) {
            console.error('❌ Connection failed:', connectionError.message);
            return;
        }
        
        console.log('✅ Supabase connection successful');
        
        // Step 3: Check team_members table schema
        console.log('\n📊 Checking team_members table schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'team_members')
            .order('ordinal_position');
        
        if (schemaError) {
            console.error('❌ Schema check failed:', schemaError.message);
            return;
        }
        
        console.log('📋 team_members table columns:');
        schemaData.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Check for quarter_id specifically
        const hasQuarterId = schemaData.some(col => col.column_name === 'quarter_id');
        console.log(`\n🔍 quarter_id column: ${hasQuarterId ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!hasQuarterId) {
            console.log('\n⚠️  This is why team member creation is failing!');
            console.log('💡 Solution: Run this SQL in your Supabase SQL Editor:');
            console.log(`
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS quarter_id TEXT REFERENCES quarters(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_team_members_quarter_id ON team_members(quarter_id);
CREATE INDEX IF NOT EXISTS idx_holidays_quarter_id ON holidays(quarter_id);
            `);
        } else {
            console.log('\n✅ Schema looks correct. Testing team member creation...');
            
            // Step 4: Test team member creation
            const testMember = {
                id: 'debug-test-' + Date.now(),
                user_id: 'debug-user-id',
                quarter_id: 'debug-quarter-id',
                name: 'Debug Test Member',
                application: 'FIS',
                allocation_pct: 100,
                pto_days: 0,
                country: 'NL'
            };
            
            const { data: insertData, error: insertError } = await supabase
                .from('team_members')
                .insert(testMember)
                .select();
            
            if (insertError) {
                console.error('❌ Team member creation failed:', insertError.message);
            } else {
                console.log('✅ Team member creation successful!');
                
                // Clean up test data
                await supabase
                    .from('team_members')
                    .delete()
                    .eq('id', testMember.id);
                
                console.log('🧹 Test data cleaned up');
            }
        }
        
        // Step 5: Check current app state
        console.log('\n📱 Checking current app state...');
        const appStore = window.useAppStore?.getState?.();
        if (appStore) {
            console.log('Current quarter ID:', appStore.currentQuarterId);
            console.log('Available quarters:', appStore.quarters.map(q => ({ id: q.id, name: q.name })));
            console.log('Team members in store:', appStore.team.length);
            console.log('Team members for current quarter:', appStore.getCurrentQuarterTeam?.()?.length || 0);
        } else {
            console.log('❌ App store not accessible');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug
debugDatabase();
